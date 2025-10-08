
// src/services/triageService.js

/**
 * CONTRACT for ML Team: Simulates the AI's determination of category and staff assignment.
 * * NOTE: The 'assignedToId' must be the _id of an existing 'staff' user in your MongoDB database
 * for the complaint document to save correctly and for later staff view testing.
 */
export const runTriageandAssign = async (mediaUrl, description) => {
    
    // 🛑 ACTION REQUIRED: REPLACE THIS PLACEHOLDER ID 
    // with the actual MongoDB _id of a 'staff' user you create for testing.
    const TEST_STAFF_ID = '68e2041de0711f6246d2d95a'; // <-- MUST BE A REAL STAFF USER ID

    let category = 'General Issues';
    
    // Simple keyword-based simulation to test the flow
    if (description && description.toLowerCase().includes('water')) {
        category = 'Water Leakage';
    } else if (description && description.toLowerCase().includes('garbage')) {
        category = 'Sanitation';
    }

    return { 
        category: category, 
        assignedToId: TEST_STAFF_ID 
    };
};
