import {Link} from 'react-router-dom'
import {BsBriefcaseFill, BsFillStarFill} from 'react-icons/bs'
import {MdLocationOn} from 'react-icons/md'

import './index.css'

const JobItem = props => {
  const {jobData} = props
  const {
    companyLogoUrl,
    title,
    rating,
    location,
    employmentType,
    packagePerAnnum,
    jobDescription,
    id,
  } = jobData

  return (
    <Link to={`/jobs/${id}`} className="link-item">
      <li className="job-item">
        <div className="job-intro-container">
          <img
            src={companyLogoUrl}
            alt="company logo"
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
        <div className="location-and-package-container">
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
          <p className="package">{packagePerAnnum}</p>
        </div>
        <hr className="horizontal-line" />
        <h1 className="description-heading">Description</h1>
        <p className="description">{jobDescription}</p>
      </li>
    </Link>
  )
}

export default JobItem
