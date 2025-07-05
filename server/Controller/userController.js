
import { User } from "../models/userModel.js";


export const getuserData = async (req, res) => {
  try {
    const user = await User.findById(req.userId); // ✅ Correct: comes from middleware

    if (!user) {
      return res.json({ success: false, message: "User Not Existing in the DataBase" });
    }

    res.json({
      success: true,
      userData: {
        name: user.name,
        isAccountVerified: user.isAccountVerified
      }
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
