const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('../utils/prisma');
const crypto = require('crypto');

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                fullName: true,
                email: true,
                profilePic: true,
                role: true
            }
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
            scope: ['profile', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log('📧 Google OAuth Profile:', {
                    id: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName
                });

                // Extract user info from Google profile
                const email = profile.emails[0].value;
                const fullName = profile.displayName;
                const profilePic = profile.photos[0]?.value || null;
                const googleId = profile.id;

                // Check if user already exists
                let user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email },
                            { googleId }
                        ]
                    }
                });

                if (user) {
                    // User exists - update Google ID if not set
                    if (!user.googleId) {
                        user = await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                googleId,
                                profilePic: profilePic || user.profilePic // Update profile pic if available
                            }
                        });
                        console.log('✅ Linked existing user to Google account:', email);
                    } else {
                        console.log('✅ User logged in with Google:', email);
                    }
                } else {
                    // Create new user
                    // Generate a random password (user won't use it, but DB requires it)
                    const randomPassword = crypto.randomBytes(32).toString('hex');
                    const bcrypt = require('bcryptjs');
                    const hashedPassword = await bcrypt.hash(randomPassword, 10);

                    user = await prisma.user.create({
                        data: {
                            fullName,
                            email,
                            password: hashedPassword,
                            profilePic,
                            googleId,
                            phone: '', // Optional: can be collected later
                            role: 'USER'
                        }
                    });
                    console.log('✅ New user created via Google OAuth:', email);
                }

                return done(null, user);
            } catch (error) {
                console.error('❌ Google OAuth Error:', error);
                return done(error, null);
            }
        }
    )
);

module.exports = passport;
