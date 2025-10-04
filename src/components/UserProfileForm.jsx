import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { religions } from '../Data/religions';
import { country } from '../Data/Country';
import { States } from '../Data/States';
import { district } from '../Data/StatesMoreData';
import './css/UserProfileForm.css'

// ✅ Load dynamic API URL
const API = import.meta.env.VITE_ENV === 'development'
  ? import.meta.env.VITE_LOCALHOST_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;


// Constants for dropdown options
const GENDER = ['Man', 'Woman', 'TransgenderMan', 'TransgenderWoman', 'Non-Binary'];
const ORIENTATION_OPTIONS = ['Heterosexual', 'Lesbian', 'Gay', 'Bisexual', 'Pansexual', 'Asexual'];
const MARITAL_STATUS = ['Single', 'Divorced', 'Widowed', 'Separated'];
const HABITS = ['Non-Smoker', 'Smoker', 'Non-Drinker', 'Drinker'];
const DIET = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian'];

const UserProfileForm = ({ isUpdateMode = false, fetchUrl = '/user', submitUrl = '/information', submitButtonText = 'Submit' }) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(!isUpdateMode);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    country: '',
    state: '',
    district: '',
    religion: '',
    branch: '',
    caste: '',
    previousReligion: '',
    previousReligionBranch: '',
    familyReligion: '',
    familyReligionBranch: '',
    certificateReligion: '',
    currentPlace: '',
    profileImage: null,
    gender: '',
    orientation: '',
    maritalStatus: '',
    dob: '',
    height: '',
    weight: '',
    education: '',
    profession: '',
    income: '',
    languages: '',
    habits: '',
    diet: '',
    partnerExpectations: '',
    disability: '',
    relocate: '',
    familyDetails: '',
    horoscope: '',
    Address: '',
  });

  const religionOptions = religions.map(r => r.name);
  const currentReligion = religions.find(r => r.name === formData.religion);
  const previousReligionObj = religions.find(r => r.name === formData.previousReligion);
  const familyReligionObj = religions.find(r => r.name === formData.familyReligion);
  const countryStatesList = States[formData.country] || [];
  const stateDistrictsList = district[formData.state] || [];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API}${fetchUrl}`, { withCredentials: true });
        const userData = response.data;
        setUserId(userData._id);
        setFormData(prev => ({
          ...prev,
          ...userData,
          dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '',
          profileImage: userData.profileImage || null,
        }));
        setIsFormVisible(true);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setErrors({ fetch: 'Failed to load user data. Please try again.' });
        setIsFormVisible(false);
      }
    };
    fetchUserData();
  }, [fetchUrl]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name && isUpdateMode) newErrors.name = 'Name is required';
    if (!formData.email && isUpdateMode) newErrors.email = 'Email is required';
    if (!formData.mobile && isUpdateMode) newErrors.mobile = 'Mobile number is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.religion) newErrors.religion = 'Religion is required';
    if (!isUpdateMode && !formData.profileImage) newErrors.profileImage = 'Profile image is required';
    if (!formData.height) newErrors.height = 'Height is required';
    if (!formData.weight) newErrors.weight = 'Weight is required';
    if (!formData.education) newErrors.education = 'Education is required';
    if (!formData.profession) newErrors.profession = 'Profession is required';
    if (!formData.income) newErrors.income = 'Income is required';
    if (!formData.languages) newErrors.languages = 'Languages Known is required';
    if (!formData.habits) newErrors.habits = 'Habits is required';
    if (!formData.diet) newErrors.diet = 'Diet Preference is required';
    if (!formData.partnerExpectations) newErrors.partnerExpectations = 'Partner Expectations is required';
    if (!formData.familyDetails) newErrors.familyDetails = 'Family Background is required';
    if (!formData.horoscope) newErrors.horoscope = 'Horoscope / Zodiac is required';
    if (!formData.Address) newErrors.Address = 'Address is required';
    if (!formData.currentPlace) newErrors.currentPlace = 'Current Place of Residence is required';
    if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital Status is required';
    if (!formData.orientation) newErrors.orientation = 'Sexual Orientation is required';

    if (formData.religion === "I don't believe in religion.") {
      if (!formData.previousReligion) newErrors.previousReligion = 'Previous Religion is required';
      if (!formData.familyReligion) newErrors.familyReligion = 'Family Religion is required';
      if (!formData.certificateReligion) newErrors.certificateReligion = 'Certificate Religion is required';
    } else {
      if (currentReligion?.branches?.length > 0 && !formData.branch) newErrors.branch = 'Religion Branch is required';
      if (currentReligion?.SocialStratification?.length > 0 && !formData.caste) newErrors.caste = 'Caste is required';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) form.append(key, value);
    });

    try {
      const method = isUpdateMode ? 'put' : 'post';
      const res = await axios({
        method,
        url: `${API}${submitUrl}`,
        data: form,
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      setMessage(res.data.message);
      setIsSubmitting(false);
      navigate(isUpdateMode ? '/home' : '/login');
    } catch (error) {
      console.error(`Error ${isUpdateMode ? 'updating' : 'saving'} user information:`, error);
      setMessage(error.response?.data?.message || `Failed to ${isUpdateMode ? 'update' : 'save'} information.`);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="matrimony-container">
        {message && <div className="matrimony-alert">{message}</div>}
        {errors.fetch && <div className="matrimony-error">{errors.fetch}</div>}
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="matrimony-form">
          {isFormVisible ? (
            <>
              <div className="matrimony-form-section">
                <h2>{isUpdateMode ? 'Update Your Profile' : 'Complete Your Profile'}</h2>
                <div className="matrimony-form-group">
                  {isUpdateMode && (
                    <>
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="matrimony-form-input"
                        required
                      />
                      {errors.name && <span className="matrimony-error">{errors.name}</span>}
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="matrimony-form-input"
                        required
                      />
                      {errors.email && <span className="matrimony-error">{errors.email}</span>}
                      <label htmlFor="mobile">Mobile Number</label>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="matrimony-form-input"
                        required
                      />
                      {errors.mobile && <span className="matrimony-error">{errors.mobile}</span>}
                    </>
                  )}
                  <label htmlFor="country">Country</label>
                  <select name="country" value={formData.country} onChange={handleChange} className="matrimony-form-select" required>
                    <option value="">Select Country</option>
                    {country.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.country && <span className="matrimony-error">{errors.country}</span>}
                  <label htmlFor="state">State</label>
                  <select name="state" value={formData.state} onChange={handleChange} className="matrimony-form-select">
                    <option value="">Select State</option>
                    {countryStatesList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <span className="matrimony-error">{errors.state}</span>}
                  <label htmlFor="district">District</label>
                  <select name="district" value={formData.district} onChange={handleChange} className="matrimony-form-select">
                    <option value="">Select District</option>
                    {stateDistrictsList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.district && <span className="matrimony-error">{errors.district}</span>}
                  <label htmlFor="religion">Religion</label>
                  <select name="religion" value={formData.religion} onChange={handleChange} className="matrimony-form-select" required>
                    <option value="">Select Religion</option>
                    {religionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {errors.religion && <span className="matrimony-error">{errors.religion}</span>}
                  {currentReligion?.branches?.length > 0 && (
                    <>
                      <label htmlFor="branch">Religion Branch</label>
                      <select name="branch" value={formData.branch} onChange={handleChange} className="matrimony-form-select" required>
                        <option value="">Select Branch</option>
                        {currentReligion.branches.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      {errors.branch && <span className="matrimony-error">{errors.branch}</span>}
                    </>
                  )}
                  {currentReligion?.SocialStratification?.length > 0 && (
                    <>
                      <label htmlFor="caste">Caste</label>
                      <select name="caste" value={formData.caste} onChange={handleChange} className="matrimony-form-select" required>
                        <option value="">Select Caste</option>
                        {currentReligion.SocialStratification.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.caste && <span className="matrimony-error">{errors.caste}</span>}
                    </>
                  )}
                  {formData.religion === "I don't believe in religion." && (
                    <>
                      <label htmlFor="previousReligion">Previous Religion</label>
                      <select name="previousReligion" value={formData.previousReligion} onChange={handleChange} className="matrimony-form-select" required>
                        <option value="">Select Previous Religion</option>
                        {religionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      {errors.previousReligion && <span className="matrimony-error">{errors.previousReligion}</span>}
                      {previousReligionObj?.branches?.length > 0 && (
                        <>
                          <label htmlFor="previousReligionBranch">Previous Religion Branch</label>
                          <select name="previousReligionBranch" value={formData.previousReligionBranch} onChange={handleChange} className="matrimony-form-select">
                            <option value="">Select Previous Branch</option>
                            {previousReligionObj.branches.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                          {errors.previousReligionBranch && <span className="matrimony-error">{errors.previousReligionBranch}</span>}
                        </>
                      )}
                      <label htmlFor="familyReligion">Family Religion</label>
                      <select name="familyReligion" value={formData.familyReligion} onChange={handleChange} className="matrimony-form-select" required>
                        <option value="">Select Family Religion</option>
                        {religionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      {errors.familyReligion && <span className="matrimony-error">{errors.familyReligion}</span>}
                      {familyReligionObj?.branches?.length > 0 && (
                        <>
                          <label htmlFor="familyReligionBranch">Family Religion Branch</label>
                          <select name="familyReligionBranch" value={formData.familyReligionBranch} onChange={handleChange} className="matrimony-form-select">
                            <option value="">Select Family Branch</option>
                            {familyReligionObj.branches.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                          {errors.familyReligionBranch && <span className="matrimony-error">{errors.familyReligionBranch}</span>}
                        </>
                      )}
                      <label htmlFor="certificateReligion">Certificate Religion</label>
                      <select name="certificateReligion" value={formData.certificateReligion} onChange={handleChange} className="matrimony-form-select" required>
                        <option value="">Select Certificate Religion</option>
                        {religionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      {errors.certificateReligion && <span className="matrimony-error">{errors.certificateReligion}</span>}
                    </>
                  )}
                  <label htmlFor="currentPlace">Current Place of Residence</label>
                  <input
                    type="text"
                    name="currentPlace"
                    placeholder="Current Place of Residence"
                    value={formData.currentPlace}
                    onChange={handleChange}
                    className="matrimony-form-input"
                    required
                  />
                  {errors.currentPlace && <span className="matrimony-error">{errors.currentPlace}</span>}
                  <label htmlFor="profileImage">Profile Image</label>
                  <input
                    type="file"
                    name="profileImage"
                    accept="image/*"
                    onChange={handleChange}
                    className="matrimony-form-input"
                    required={!isUpdateMode}
                  />
                  {errors.profileImage && <span className="matrimony-error">{errors.profileImage}</span>}
                  <label htmlFor="gender">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="matrimony-form-select" required>
                    <option value="">Select Gender</option>
                    {GENDER.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  {errors.gender && <span className="matrimony-error">{errors.gender}</span>}
                  <label htmlFor="orientation">Sexual Orientation</label>
                  <select name="orientation" value={formData.orientation} onChange={handleChange} className="matrimony-form-select" required>
                    <option value="">Select Orientation</option>
                    {ORIENTATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  {errors.orientation && <span className="matrimony-error">{errors.orientation}</span>}
                  <label htmlFor="maritalStatus">Marital Status</label>
                  <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="matrimony-form-select" required>
                    <option value="">Select Marital Status</option>
                    {MARITAL_STATUS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  {errors.maritalStatus && <span className="matrimony-error">{errors.maritalStatus}</span>}
                  <label htmlFor="dob">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="matrimony-form-input"
                    required
                  />
                  {errors.dob && <span className="matrimony-error">{errors.dob}</span>}
                  <label htmlFor="height">Height (in cm)</label>
                  <input
                    type="number"
                    name="height"
                    placeholder="Height in cm"
                    value={formData.height}
                    onChange={handleChange}
                    className="matrimony-form-input"
                    required
                  />
                  {errors.height && <span className="matrimony-error">{errors.height}</span>}
                  <label htmlFor="weight">Weight (in kg)</label>
                  <input
                    type="number"
                    name="weight"
                    placeholder="Weight in kg"
                    value={formData.weight}
                    onChange={handleChange}
                    className="matrimony-form-input"
                    required
                  />
                  {errors.weight && <span className="matrimony-error">{errors.weight}</span>}
                  <label htmlFor="education">Education</label>
                  <input
                    type="text"
                    name="education"
                    placeholder="Education (e.g., Bachelor's in Engineering)"
                    value={formData.education}
                    onChange={handleChange}
                    className="matrimony-form-input"
                    required
                  />
                  {errors.education && <span className="matrimony-error">{errors.education}</span>}
                  <label htmlFor="profession">Profession</label>
                  <input
                    type="text"
                    name="profession"
                    placeholder="Profession (e.g., Software Engineer)"
                    value={formData.profession}
                    onChange={handleChange}
                    className="matrimony-form-input"
                    required
                  />
                  {errors.profession && <span className="matrimony-error">{errors.profession}</span>}
                  <label htmlFor="income">Annual Income</label>
                  <input
                    type="text"
                    name="income"
                    placeholder="Annual Income (e.g., $50,000)"
                    value={formData.income}
                    onChange={handleChange}
                    className="matrimony-form-input"
                    required
                  />
                  {errors.income && <span className="matrimony-error">{errors.income}</span>}
                  <label htmlFor="languages">Languages Known</label>
                  <input
                    type="text"
                    name="languages"
                    placeholder="Languages Known (e.g., English, Hindi, Malayalam)"
                    value={formData.languages}
                    onChange={handleChange}
                    className="matrimony-form-input"
                    required
                  />
                  {errors.languages && <span className="matrimony-error">{errors.languages}</span>}
                  <label htmlFor="habits">Habits</label>
                  <select name="habits" value={formData.habits} onChange={handleChange} className="matrimony-form-select" required>
                    <option value="">Select Habits</option>
                    {HABITS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  {errors.habits && <span className="matrimony-error">{errors.habits}</span>}
                  <label htmlFor="diet">Diet Preference</label>
                  <select name="diet" value={formData.diet} onChange={handleChange} className="matrimony-form-select" required>
                    <option value="">Select Diet Preference</option>
                    {DIET.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.diet && <span className="matrimony-error">{errors.diet}</span>}
                  <label htmlFor="partnerExpectations">Partner Expectations</label>
                  <textarea
                    name="partnerExpectations"
                    placeholder="Describe your partner expectations"
                    value={formData.partnerExpectations}
                    onChange={handleChange}
                    className="matrimony-form-textarea"
                    required
                  />
                  {errors.partnerExpectations && <span className="matrimony-error">{errors.partnerExpectations}</span>}
                  <label htmlFor="disability">Any Disability (optional)</label>
                  <input
                    type="text"
                    name="disability"
                    placeholder="Any Disability (optional)"
                    value={formData.disability}
                    onChange={handleChange}
                    className="matrimony-form-input"
                  />
                  {errors.disability && <span className="matrimony-error">{errors.disability}</span>}
                  <label htmlFor="relocate">Willingness to Relocate</label>
                  <input
                    type="text"
                    name="relocate"
                    placeholder="Willingness to relocate? (e.g., Yes, No, Within State)"
                    value={formData.relocate}
                    onChange={handleChange}
                    className="matrimony-form-input"
                    required
                  />
                  {errors.relocate && <span className="matrimony-error">{errors.relocate}</span>}
                  <label htmlFor="familyDetails">Family Background</label>
                  <textarea
                    name="familyDetails"
                    placeholder="Family Background (e.g., Joint family, Nuclear family, number of siblings)"
                    value={formData.familyDetails}
                    onChange={handleChange}
                    className="matrimony-form-textarea"
                    required
                  />
                  {errors.familyDetails && <span className="matrimony-error">{errors.familyDetails}</span>}
                  <label htmlFor="horoscope">Horoscope / Zodiac</label>
                  <input
                    type="text"
                    name="horoscope"
                    placeholder="Horoscope / Zodiac (e.g., Aries, Gemini, details if applicable)"
                    value={formData.horoscope}
                    onChange={handleChange}
                    className="matrimony-form-input"
                    required
                  />
                  {errors.horoscope && <span className="matrimony-error">{errors.horoscope}</span>}
                  <label htmlFor="Address">Address</label>
                  <input
                    type="text"
                    name="Address"
                    placeholder="Full Address"
                    value={formData.Address}
                    onChange={handleChange}
                    className="matrimony-form-input"
                    required
                  />
                  {errors.Address && <span className="matrimony-error">{errors.Address}</span>}
                </div>
              </div>
              <hr />
              <button type="submit" className="matrimony-form-submit" disabled={isSubmitting}>
                {isSubmitting ? (isUpdateMode ? 'Updating...' : 'Submitting...') : submitButtonText}
              </button>
            </>
          ) : (
            !errors.fetch ? (
              <p className="matrimony-loading">Loading your profile data...</p>
            ) : null
          )}
        </form>
      </div>
    </>
  );
};

export default UserProfileForm;