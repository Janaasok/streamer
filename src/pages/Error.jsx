
import React from 'react';

const Error = ({ errorMessage }) => {
  return (
    <div>
      {errorMessage ? errorMessage : "An unexpected error occurred."}
    </div>
  );
};

export default Error;

