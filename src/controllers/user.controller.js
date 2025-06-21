import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import path from "path";

const registerUser = asyncHandler(async (req, res) => {
  console.log("✅ Register route hit");

  // Step 1: Extract form fields from req.body
  const { fullName, email, username, password } = req.body;
  console.log("📥 Form Data:", req.body);
  console.log("📎 Uploaded Files:", req.files);

  // Step 2: Validate required fields
  if ([fullName, email, username, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  // Step 3: Check for duplicate user
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with same username or email already exists");
  }

  // Step 4: Get file paths (make sure multer is working)
  const avatarLocalPath = path.resolve(req.files?.avatar?.[0]?.path || "");
  const coverImageLocalPath = path.resolve(req.files?.coverImage?.[0]?.path || "");


  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Step 5: Upload to Cloudinary
  console.log("☁️ Uploading avatar...");
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log("✅ Avatar uploaded:", avatar?.url);

  console.log("☁️ Uploading cover image...");
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log("✅ Cover image uploaded:", coverImage?.url);

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar image");
  }

  // Step 6: Create user in DB
  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // Step 7: Remove sensitive fields before sending response
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Step 8: Send response
  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully ✅")
  );
});

export { registerUser };
