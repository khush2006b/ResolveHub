import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import crypto from "crypto";
import { User } from "../models/User.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../services/authService.js";
import {VerificationCode} from "../models/Verificationmodel.js" 

const router = express.Router();

// Debug endpoint to check user details
router.get('/debug/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        console.log(`[Debug User] User details:`, {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            city: user.city,
            department: user.department
        });
        
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            city: user.city,
            department: user.department,
            points: user.points || 0,
            resolutionStreak: user.resolutionStreak || 0,
            topFixerBadge: user.topFixerBadge || 'Rookie'
        });
    } catch (err) {
        console.error('Debug user fetch error:', err);
        res.status(500).json({ error: err.message });
    }
});

const getGlobalAdmin = async () => await User.findOne({ role: 'admin', city: 'Global' });

const getCitiesWithAdmin = async() => {
    const admins = await User.find({
        role : 'admin'
    }).select('city');
    return admins.map(a => a.city);
}

// Register User
router.post("/register", async (req, res) => {
    const { name, email, password, role : desiredRole, department, city, verificationcode } = req.body;
   console.log("in auth.js \n : ", {verificationcode}) ;
 try {
         let user = await User.findOne({ email });
         if (user) return res.status(400).json({ msg: "User already exists" });
        // Initialize default user data
         let finalRole = 'citizen'
         let finalCity = null
        let finalDepartment = null

         const citiesWithAdmin = await getCitiesWithAdmin()
 
       // prevent admin registration
         if (desiredRole === 'admin') {
        return res
          .status(403)
           .json({ msg: 'Admin cannot register via this endpoint. Contact system administrator.' })
         }
        
           if(desiredRole === 'staff'){
           if (!city || !department || !verificationcode) {
          return res.status(400).json({ msg: 'City, Department, and Verification Code are required for staff registration.' })
           }
            
            const cityLowerCase = city.toLowerCase();

          if(!citiesWithAdmin.map(c => c.toLowerCase()).includes(cityLowerCase)){
           return res
           .status(403)
                    .json({msg: `Staff registration for ${city} is not available as no admin exists yet`})
            }

            // FIX: Ensure code is uppercase and query is case-insensitive on city
            const validCode = await VerificationCode.findOne({
                code : verificationcode.toUpperCase(), 
                used: false, 
                city: { $regex: new RegExp(`^${city}$`, 'i') }
            })
            console.log("Valid code found: ", validCode) ;
            
            if (!validCode) {
                console.log(`Verification failure: No valid code found for ${city} with code ${verificationcode}`);
                return res.status(403).json({ msg: 'Invalid verification code.' })
            }

            if (validCode.expiresAt < new Date()) {
                console.log(`Verification failure: Code expired at ${validCode.expiresAt}`);
                return res.status(403).json({ msg: 'Expired verification code. Request a new one from your admin.' })
            }
            
            finalRole = 'staff'
            finalCity = city
            finalDepartment = department
            
            // Mark code as used
            validCode.used = true
            await validCode.save()
        }

        if(finalRole === 'citizen'){
            if (city && !citiesWithAdmin.map(c => c.toLowerCase()).includes(city.toLowerCase())) {
                const gAdmin = await getGlobalAdmin() 
                const gAdminEmail = gAdmin ? gAdmin.email : 'No global admin yet'
                console.log(
                `Citizen registered for city ${city} with no admin yet. Global Admin (${gAdminEmail}) will handle complaints temporarily.`
                )
            }
            finalCity = city || null;
            finalDepartment = null;
        }

        // create new user
         user = new User({
            name,
            email,
            password,
            role: finalRole,
            city: finalCity,
            department: finalDepartment
        })
console.log("New user data: ", user) ;

        // Hash password
        user.password = await hashPassword(password);
        console.log("Hashed password: ", user.password);
        await user.save({ validateBeforeSave: true });
        console.log("User saved successfully: ", user);
        const token = generateToken(user.id, user.role);
        console.log("Registration successful, token generated.") ;
        res.json({ token, role : user.role });
    } catch (err) {
        console.error('REGISTRATION ERROR:', err.message);
        console.error('REGISTRATION ERROR STACK:', err.stack);
        // If the error is a validation error (e.g., duplicate email from Mongoose) return 400
        if (err.name === 'MongoServerError' && err.code === 11000) {
            return res.status(400).json({ msg: 'Email already exists.', error: err.message });
        }
        res.status(500).send("Server error");
    }
});

// login
router.post("/login", async (req, res) => {
  const { email, password, city, department } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    if (!user.password) {
      return res.status(400).json({
        msg: "No password for this user. Use social login or reset password.",
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });
    
    // Admin city validation
    if (user.role === 'admin') {
      if (!city || user.city !== city) {
        return res.status(403).json({ msg: 'Invalid city for admin login' })
      }
    }

    // Staff validation (city + dept)
    if (user.role === 'staff') {
      if (!city || !department || user.city !== city || user.department !== department) {
        return res.status(403).json({ msg: 'Invalid city or department for staff login' })
      }
    }

    const token = generateToken(user.id, user.role);
    res.json({ token, role : user.role, city : user.city });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Helper: find or create social user
const findOrCreateSocialUser = async ({
  provider,
  providerId,
  displayName,
  emails,
  roleHint,
}) => {
  let user = await User.findOne({ provider, providerId });

  const email =
    emails && emails[0] && emails[0].value
      ? emails[0].value.toLowerCase()
      : null;

  if (!user && email) user = await User.findOne({ email });

  if (user) {
    if (!user.provider || user.provider !== provider || !user.providerId) {
      user.provider = provider;
      user.providerId = providerId;
      await user.save();
    }
    return user;
  }

  const randomPassword = crypto.randomBytes(16).toString("hex");
  const hashed = await hashPassword(randomPassword);

  const newUser = new User({
    name: displayName || (email ? email.split("@")[0] : "Unknown"),
    email: email || `no-email-${provider}-${providerId}@example.com`,
    password: hashed,
    role: roleHint || "citizen",
    provider,
    providerId,
  });

  await newUser.save();
  return newUser;
};

// Configure Google Strategy (if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateSocialUser({
            provider: "google",
            providerId: profile.id,
            displayName: profile.displayName,
            emails: profile.emails,
          });
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
} else {
  console.warn("Google OAuth credentials not configured. Google authentication will be disabled.");
}

// Configure GitHub Strategy (if credentials are provided)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateSocialUser({
            provider: "github",
            providerId: profile.id,
            displayName: profile.displayName || profile.username,
            emails: profile.emails,
          });
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
} else {
  console.warn("GitHub OAuth credentials not configured. GitHub authentication will be disabled.");
}

// serialize / deserialize for session
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user || null);
  } catch (err) {
    done(err, null);
  }
});

/**
 * SOCIAL ROUTES
 */

// Google OAuth (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  router.get(
    "/google/callback",
    passport.authenticate("google", {
      failureRedirect: `${process.env.FRONTEND_URL}/oauth-failure`,
      session: false,
    }),
    (req, res) => {
      const token = generateToken(req.user.id, req.user.role);
      res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
    }
  );
}

// GitHub OAuth (only if configured)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  router.get(
    "/github",
    passport.authenticate("github", { scope: ["user:email"] })
  );
  router.get(
    "/github/callback",
    passport.authenticate("github", {
      failureRedirect: `${process.env.FRONTEND_URL}/oauth-failure`,
      session: false,
    }),
    (req, res) => {
      const token = generateToken(req.user.id, req.user.role);
      res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
    }
  );
}

export default router;
