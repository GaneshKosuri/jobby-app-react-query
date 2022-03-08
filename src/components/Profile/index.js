import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {useQuery} from 'react-query'

import './index.css'

const fetchProfile = () => {
  const jwtToken = Cookies.get('jwt_token')
  const profileApiUrl = 'https://apis.ccbp.in/profile'
  const options = {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    method: 'GET',
  }
  return fetch(profileApiUrl, options).then(res => {
    const result = res.json()
    return result
  })
}

const Profile = () => {
  const {data: profileData, isLoading, isError, refetch} = useQuery(
    'profile',
    fetchProfile,
    {
      select: response => {
        const profile = response.profile_details
        const updatedData = {
          name: profile.name,
          profileImageUrl: profile.profile_image_url,
          shortBio: profile.short_bio,
        }
        return updatedData
      },
    },
  )

  const renderProfile = () => {
    const {profileImageUrl, name, shortBio} = profileData
    return (
      <div className="profile-container">
        <img src={profileImageUrl} alt="profile" className="profile-img" />
        <h1 className="profile-name">{name}</h1>
        <p className="short-bio">{shortBio}</p>
      </div>
    )
  }

  const renderProfileFailureView = () => (
    <div className="profile-failure-view">
      <button type="button" className="retry-button" onClick={refetch}>
        Retry
      </button>
    </div>
  )

  const renderLoadingView = () => (
    <div className="profile-loader-container">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  return (
    <>
      {isLoading && renderLoadingView()}
      {isError && renderProfileFailureView()}
      {profileData && renderProfile()}
    </>
  )
}

export default Profile
