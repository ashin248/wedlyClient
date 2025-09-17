import React from 'react';
import UserProfileForm from './UserProfileForm';


const UpdateInformation = () => {
  return (
    <UserProfileForm
      isUpdateMode
      fetchUrl="/information"
      submitButtonText="Update Profile"
    />
  );
};

export default UpdateInformation;
