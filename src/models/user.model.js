import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    age: Number,
    password: String,
    admin: Boolean,
})

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
