import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/validations/auth';
import { connectToDatabase } from '@/lib/database/db';
import User from '@/model/User.model';
import { sendVerificationEmail } from '@/lib/Email';

const CODE_EXPIRY_MS = 10 * 60 * 1000;

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id || !mongoose.Types.ObjectId.isValid(session.user.id)) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		await connectToDatabase();
		const user = await User.findById(session.user.id).select(
			'secondaryEmail secondaryEmailVerified',
		);
		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		return NextResponse.json({
			secondaryEmail: user.secondaryEmail ?? null,
			secondaryEmailVerified: user.secondaryEmailVerified ?? false,
		});
	} catch (error) {
		console.error('Secondary email lookup failed:', error);
		return NextResponse.json({ error: 'Unable to fetch secondary email' }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id || !mongoose.Types.ObjectId.isValid(session.user.id)) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();
		const action = body.action as 'request' | 'verify';
		const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

		if (!email || !email.includes('@')) {
			return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
		}

		await connectToDatabase();
		const user = await User.findById(session.user.id).select(
			'+secondaryEmailVerifyCode +secondaryEmailVerifyCodeExpiry',
		);
		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		if (user.email.toLowerCase() === email) {
			return NextResponse.json(
				{ error: 'Secondary email must be different from your primary email' },
				{ status: 400 },
			);
		}

		const emailInUse = await User.exists({
			$or: [{ email }, { secondaryEmail: email }],
			_id: { $ne: user._id },
		});
		if (emailInUse) {
			return NextResponse.json({ error: 'Email is already in use' }, { status: 409 });
		}

		if (action === 'request') {
			const code = Math.floor(100000 + Math.random() * 900000).toString();
			user.secondaryEmail = email;
			user.secondaryEmailVerified = false;
			user.secondaryEmailVerifyCode = code;
			user.secondaryEmailVerifyCodeExpiry = new Date(Date.now() + CODE_EXPIRY_MS);
			await user.save();
			await Promise.all([
				sendVerificationEmail(user.email, user.username, code),
				sendVerificationEmail(email, user.username, code),
			]);

			return NextResponse.json({
				message: 'Verification code sent to both email addresses',
			});
		}

		if (action !== 'verify' || user.secondaryEmail !== email) {
			return NextResponse.json({ error: 'Invalid verification request' }, { status: 400 });
		}

		if (
			user.secondaryEmailVerifyCode !== body.code ||
			!user.secondaryEmailVerifyCodeExpiry ||
			user.secondaryEmailVerifyCodeExpiry < new Date()
		) {
			return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
		}

		user.secondaryEmailVerified = true;
		user.secondaryEmailVerifyCode = undefined;
		user.secondaryEmailVerifyCodeExpiry = undefined;
		await user.save();

		return NextResponse.json({ message: 'Secondary email verified' });
	} catch (error) {
		console.error('Secondary email error:', error);
		return NextResponse.json({ error: 'Unable to process secondary email' }, { status: 500 });
	}
}
