const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
} = require('../validators/authValidator');

// ─── Register ────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const { errors, isValid } = validateRegister({ name, email, password });
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        errors: { email: 'An account with this email already exists' },
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { errors, isValid } = validateLogin({ email, password });
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        errors: { email: 'Invalid email or password' },
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        errors: { password: 'Invalid email or password' },
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Logout ──────────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    // JWT is stateless; logout is handled client-side by removing the token.
    // This endpoint exists so the frontend has a consistent logout API call.
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Current User ────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by the protect middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Profile ──────────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, theme, currentPassword, newPassword } = req.body;

    const { errors, isValid } = validateProfileUpdate({
      name,
      currentPassword,
      newPassword,
    });
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update basic fields
    if (name !== undefined) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();
    if (theme !== undefined && ['light', 'dark'].includes(theme)) {
      user.theme = theme;
    }

    // Handle password change
    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          errors: { currentPassword: 'Current password is incorrect' },
        });
      }
      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe, updateProfile };