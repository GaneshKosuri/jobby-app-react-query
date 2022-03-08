import {BsSearch} from 'react-icons/bs'

import './index.css'

const FindJobsHeader = props => {
  const {searchInput} = props
  const onSearch = () => {
    const {enterSearchInput} = props
    enterSearchInput()
  }

  const onChangeSearchInput = event => {
    const {changeSearchInput} = props
    changeSearchInput(event.target.value)
  }

  return (
    <div className="jobs-header">
      <div className="search-input-container">
        <input
          value={searchInput}
          type="search"
          className="search-input"
          placeholder="Search"
          onChange={onChangeSearchInput}
        />
        <button
          type="button"
          testid="searchButton"
          className="search-button"
          onClick={onSearch}
        >
          <BsSearch className="search-icon" />
        </button>
      </div>
    </div>
  )
}

export default FindJobsHeader
