import {BsBriefcaseFill, BsFillStarFill} from 'react-icons/bs'
import {MdLocationOn} from 'react-icons/md'

import './index.css'

const SimilarJobItem = props => {
  const {jobDetails} = props
  const {
    companyLogoUrl,
    title,
    jobDescription,
    location,
    employmentType,
    rating,
  } = jobDetails
  return (
    <li className="similar-job-item">
      <div className="job-intro-container">
        <img
          src={companyLogoUrl}
          alt="similar job company logo"
          className="company-logo"
        />
        <div>
          <h1 className="title">{title}</h1>
          <div className="rating-container">
            <BsFillStarFill className="star" />
            <p className="rating">{rating}</p>
          </div>
        </div>
      </div>
      <h1 className="similar-jobs-description-heading">Description</h1>
      <p className="similar-job-description">{jobDescription}</p>
      <div className="location-type-container">
        <div className="location-container">
          <MdLocationOn className="location-icon" />
          <p className="location">{location}</p>
        </div>
        <div className="employment-type-container">
          <BsBriefcaseFill className="employment-type-icon" />
          <p className="employment-type">{employmentType}</p>
        </div>
      </div>
    </li>
  )
}

export default SimilarJobItem
