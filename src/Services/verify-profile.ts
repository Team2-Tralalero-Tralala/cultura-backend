
import { getProfile } from "./auth-service";
import prisma from "./database-service";

async function verify() {
    try {
        console.log("Finding a user...");
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log("No user found in database to test with.");
            return;
        }
        console.log(`Found user: ${user.username} (ID: ${user.id})`);

        console.log("Testing getProfile...");
        const profile = await getProfile(user.id);
        console.log("Profile result:", profile);

        if (profile.fname === user.fname && profile.email === user.email && profile.role) {
            console.log("Verification SUCCESS: Profile matches user data.");
        } else {
            console.error("Verification FAILED: Profile data mismatch.");
        }
    } catch (error) {
        console.error("Verification Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
