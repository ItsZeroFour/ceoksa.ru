import User from "../models/User.js";

export const updateUser = async (req, res) => {
  const protected_fields = ["phone", "mts_sub", "lastAuthAt"];

  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Пользователь не авторизован",
      });
    }

    const updateData = { ...req.body };

    protected_fields.forEach((field) => {
      delete updateData[field];
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Ошибка при обновлении пользователя:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка сервера при обновлении данных",
      error: error.message,
    });
  }
};
