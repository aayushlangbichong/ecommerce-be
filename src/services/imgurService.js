import axios from "axios";
import FormData from "form-data";
import { IMGUR_API_URL } from "../constants/urls.js";
import env from "../constants/env.js";

const imgurApi = axios.create({
  baseURL: IMGUR_API_URL,
  headers: {
    Authorization: `Client-ID ${env.IMGUR_CLIENT_ID}`,
  },
});

export const uploadImage = async (imageBuffer) => {
  try {
    const formData = new FormData();
    formData.append("image", imageBuffer);

    const response = await imgurApi.post("/image", formData);
    return response.data.data;
  } catch (error) {
    console.log(error);

    throw new Error("Failed to upload image to Imgur");
  }
};

export const deleteImage = async (imgurId) => {
  try {
    await imgurApi.delete(`/image/${imgurId}`);
  } catch (error) {
    console.log(error);

    throw new Error(error);
  }
};
