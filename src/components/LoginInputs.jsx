import React from "react";
import InputField from "./InputField";

const LoginInputs = ({ email, setEmail, password, setPassword }) => {
  return (
    <>
      <InputField value={email} setValue={setEmail} label="Email" type="email" placeholder="Enter your email" />
      <InputField value={password} setValue={setPassword} label="Password" type="password" placeholder="Enter your password" />
    </>
  );
};

export default LoginInputs;
