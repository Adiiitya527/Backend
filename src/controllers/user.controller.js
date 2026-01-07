import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshTokens=async(userId) => {
  try {
    const user=await User.findById(userId)
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()

    user.refreshToken=refreshToken
    await user.save({validateBeforeSave:false})

    return {accessToken,refreshToken}

  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating tokens")
  }
}

const registerUser = asyncHandler(async (req, res) => {

  const { fullName, email, username, password } = req.body;

  console.log("BODY:", req.body);
  console.log("FILES:", req.files);

  // Validate text fields
  if (!fullName || !email || !username || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // Check existing user
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }


  // SAFE file access 
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar?.url) {
    throw new ApiError(400, "Avatar upload failed");
  }

  let coverImageUrl = "";
  if (coverImageLocalPath) {
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    coverImageUrl = coverImage?.url || "";
  }

  // Create user
  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImageUrl,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

const loginUser=asyncHandler(async(req,res)=>{
  // req body->data

  // username or email
 const{email,username,password}=req.body
 if (!username || !email) {
  throw new ApiError(400,"username or password is required")
  }

  // find the user
  const user=await User.findOne({
    $or:[{username},{email}]
  })
  if (!user) {
    throw new ApiError(404,"User does not exist")
  }

  // password check
  const ispasswordValid=await user.isPasswordCorrect(password)
  if (!ispasswordValid) {
    throw new ApiError(401,"Incorrect password")
  }

  // access and refresh token
  const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

  // send cookies
  const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
  const options={
    httpOnly:true,
    secure:true
  }
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user:loggedInUser,accessToken,refreshToken
      },
      "User logged in successfully"
    )
  )

})

const logOutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined
      },
    },
    {
      new:true
    }
  )
  const options={
    httpOnly:true,
    secure:true
  }
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User logged out successfully"))
})

export { 
registerUser,
loginUser,
logOutUser
};
