import './index.css'

const FiltersGroup = props => {
  const renderSalaryRangesList = () => {
    const {salaryRangesList, changeSalaryRange} = props

    return salaryRangesList.map(salaryRange => {
      const {salaryRangeId} = salaryRange
      const onChangeSalaryRange = () => {
        changeSalaryRange(salaryRangeId)
      }

      return (
        <li className="salary-range-item" key={salaryRange.salaryRangeId}>
          <input
            className="salary-range-radio-button"
            id={salaryRange.salaryRangeId}
            type="radio"
            name="salary_range"
            onChange={onChangeSalaryRange}
          />
          <label
            className="salary-range-label"
            htmlFor={salaryRange.salaryRangeId}
          >
            {salaryRange.label}
          </label>
        </li>
      )
    })
  }

  const renderSalaryRanges = () => (
    <div>
      <h1 className="salary-range-heading">Salary Range</h1>
      <ul className="salary-range-list">{renderSalaryRangesList()}</ul>
    </div>
  )

  const renderEmploymentTypeList = () => {
    const {employmentTypesList} = props

    return employmentTypesList.map(employmentType => {
      const {changeEmploymentType} = props
      const onChangeEmploymentType = event => {
        const {checked} = event.target
        const {employmentTypeId} = employmentType
        changeEmploymentType(checked, employmentTypeId)
      }

      return (
        <li
          className="employment-type-item"
          key={employmentType.employmentTypeId}
        >
          <input
            className="employment-type-checkbox"
            id={employmentType.employmentTypeId}
            type="checkbox"
            onChange={onChangeEmploymentType}
          />
          <label
            className="employment-type-label"
            htmlFor={employmentType.employmentTypeId}
          >
            {employmentType.label}
          </label>
        </li>
      )
    })
  }

  const renderEmploymentTypes = () => (
    <>
      <h1 className="employment-type-heading">Type of Employment</h1>
      <ul className="employment-type-list">{renderEmploymentTypeList()}</ul>
      <hr className="horizontal-line" />
    </>
  )

  return (
    <div className="filters-group-container">
      {renderEmploymentTypes()}
      {renderSalaryRanges()}
    </div>
  )
}

export default FiltersGroup
