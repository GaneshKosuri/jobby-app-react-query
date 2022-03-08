import {BrowserRouter} from 'react-router-dom'
import {rest} from 'msw'
import {setupServer} from 'msw/node'
import Cookies from 'js-cookie'

import {render, screen, waitForElementToBeRemoved} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from '../App'

const websiteLogo = 'https://assets.ccbp.in/frontend/react-js/logo-img.png'
const errorView = 'https://assets.ccbp.in/frontend/react-js/failure-img.png'
const noJobsView = 'https://assets.ccbp.in/frontend/react-js/no-jobs-img.png'
const loginRoutePath = '/login'
const jobsRoutePath = '/jobs'
const homeRoutePath = '/'

const mockGetCookie = (returnToken = true) => {
  let mockedGetCookie
  if (returnToken) {
    mockedGetCookie = jest.fn(() => ({
      jwt_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJhamEiLCJyb2xlIjoiVVNFUiIsImlhdCI6MTYxOTY5MTMwN30.T--R95wvSdSpRlHWeKGbP3yTSq2wk196PqpqUamuM_g',
    }))
  } else {
    mockedGetCookie = jest.fn(() => undefined)
  }
  jest.spyOn(Cookies, 'get')
  Cookies.get = mockedGetCookie
}

const restoreGetCookieFns = () => {
  Cookies.get.mockRestore()
}

const renderWithBrowserRouter = (ui, {route = '/jobs'} = {}) => {
  window.history.pushState({}, 'Test page', route)
  return render(ui, {wrapper: BrowserRouter})
}

const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULLTIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PARTTIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]
const jobsResponse = {
  jobs: [
    {
      id: 101,
      title: 'Software Developer',
      rating: 202,
      company_name: 'Amazon',
      location: 'Hyderabad',
      employment_type: 'FULLTIME',
      job_description:
        'Amazon Lex is a platform for building conversational interfaces into any application. It provides the advanced deep learning functionalities of automatic speech recognition (ASR) for converting speech to text and natural language understanding (NLU) to recognize the intent of the text. Be a part of a well-balanced team with diverse experience.',
      package_per_annum: '25 LPA',
      company_logo_url:
        'https://assets.ccbp.in/frontend/react-js/jobby-app/netflix-img.png',
    },
    {
      id: 102,
      title: 'Hardware Developer',
      rating: 206,
      company_name: 'Amazon',
      location: 'Delhi',
      employment_type: 'PARTTIME',
      job_description:
        'Amazon Lex is a platform for building into any application. It provides the advanced deep learning functionalities of automatic speech recognition (ASR) for converting speech to text and natural language understanding (NLU) to recognize the intent of the text. Be a part of a well-balanced team with diverse experience.',
      package_per_annum: '26 LPA',
      company_logo_url:
        'https://assets.ccbp.in/frontend/react-js/jobby-app/facebook-img.png',
    },
  ],
  total: 2,
}

const profileResponse = {
  profile_details: {
    name: 'Rahul Attuluri',
    profile_image_url:
      'https://assets.ccbp.in/frontend/react-js/male-avatar-img.png',
    short_bio: 'Lead Hardware Developer and AI-ML expert',
  },
}

const jobDetailsResponse = {
  job_details: {
    id: 101,
    title: '101 title',
    rating: 202,
    company_name: 'Amazon',
    company_website_url: 'https://www.w3schools.com',
    location: 'MUMBAI',
    employment_type: 'FREELANCE',
    job_description: '101 some random description',
    package_per_annum: '10 LPA',
    company_logo_url:
      'https://assets.ccbp.in/frontend/react-js/jobby-app/netflix-img.png',
    skills: [
      {
        name: 'HTML',
        image_url:
          'https://assets.ccbp.in/frontend/react-js/jobby-app/html-img.png',
      },
      {
        name: 'CSS',
        image_url:
          'https://assets.ccbp.in/frontend/react-js/jobby-app/css-img.png',
      },
    ],
    life_at_company: {
      description: 'string',
      image_url:
        'https://assets.ccbp.in/frontend/react-js/jobby-app/life-netflix-img.png',
    },
  },
  similar_jobs: [
    {
      id: 103,
      title: '103 title',
      company_name: 'Amazon',
      company_logo_url:
        'https://assets.ccbp.in/frontend/react-js/jobby-app/netflix-img.png',
      location: 'BANGALORE',
      employment_type: 'FULLTIME',
      job_description: '103 some random description',
      rating: 206,
    },
    {
      id: 107,
      title: '107 title',
      company_name: 'Amazon',
      company_logo_url:
        'https://assets.ccbp.in/frontend/react-js/jobby-app/netflix-img.png',
      location: 'CHENNAI',
      employment_type: 'PARTTIME',
      job_description: '107 some random description',
      rating: 214,
    },
    {
      id: 109,
      title: '109 title',
      company_name: 'Amazon',
      company_logo_url:
        'https://assets.ccbp.in/frontend/react-js/jobby-app/netflix-img.png',
      location: 'HYDERABAD',
      employment_type: 'INTERNSHIP',
      job_description: '109 some random description',
      rating: 218,
    },
  ],
}

const profileApiUrl = 'https://apis.ccbp.in/profile'
const jobsApiUrl = 'https://apis.ccbp.in/jobs'
const jobDetailsApiUrl = 'https://apis.ccbp.in/jobs/:id'

const handlers = [
  rest.get(profileApiUrl, (req, res, ctx) => res(ctx.json(profileResponse))),
  rest.get(jobsApiUrl, (req, res, ctx) => res(ctx.json(jobsResponse))),
  rest.get(jobDetailsApiUrl, (req, res, ctx) =>
    res(ctx.json(jobDetailsResponse)),
  ),
]

const server = setupServer(...handlers)

const originalConsoleError = console.error
const originalFetch = window.fetch

describe('Jobs Route tests', () => {
  beforeAll(() => {
    server.listen()
  })

  afterAll(() => {
    server.close()
  })

  afterEach(() => {
    server.resetHandlers()
    console.error = originalConsoleError
    window.fetch = originalFetch
  })

  beforeAll(() => {
    server.listen()
  })

  afterAll(() => {
    server.close()
  })

  afterEach(() => {
    server.resetHandlers()
    console.error = originalConsoleError
    window.fetch = originalFetch
  })

  it('Page should consist of at least two HTML list items, jobs list received from the response and the provided employmentTypesList, salaryRangesList should be rendered using a unique key as a prop for each employment type item, salary range item and job item respectively:::5:::', async () => {
    mockGetCookie()
    console.error = message => {
      if (
        /Each child in a list should have a unique "key" prop/.test(message) ||
        /Encountered two children with the same key/.test(message)
      ) {
        throw new Error(message)
      }
    }
    renderWithBrowserRouter(<App />)
    await waitForElementToBeRemoved(() => screen.queryAllByTestId('loader'))
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(2)
    restoreGetCookieFns()
  })

  it('When "/jobs" is provided as the URL path by an unauthenticated user, then the page should be navigated to the Login Route and consist of an HTML button element with text content as "Login":::5:::', () => {
    mockGetCookie(false)
    renderWithBrowserRouter(<App />)
    expect(window.location.pathname).toBe(loginRoutePath)
    const loginButton = screen.getByRole('button', {
      name: /Login/i,
    })
    expect(loginButton).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('When "/jobs" is provided in the URL path by an authenticated user, then the page should be navigated to the Jobs Route and should consist of an HTML main heading element with text content as "Type of Employment":::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(window.location.pathname).toBe(jobsRoutePath)
    expect(
      await screen.findByRole('heading', {
        name: /Type of Employment/i,
      }),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('Jobs Route should consist of an HTML image element with alt attribute value as "website logo" and src as given website logo image URL:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const imageEls = await screen.findAllByRole('img', {
      name: /website logo/i,
    })
    expect(imageEls[0]).toBeInTheDocument()
    expect(imageEls[0].src).toBe(websiteLogo)
    restoreGetCookieFns()
  })

  it('Jobs Route should consist of an HTML input element with type attribute value as "search":::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const searchEls = await screen.findAllByRole('searchbox')
    expect(searchEls.length).toBeGreaterThanOrEqual(1)
    expect(searchEls[0].type).toBe('search')
    restoreGetCookieFns()
  })

  it('Jobs Route should consist of an HTML button element with testid attribute value as "searchButton":::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const searchBtnEls = await screen.findAllByTestId('searchButton')
    expect(searchBtnEls.length).toBeGreaterThanOrEqual(1)
    expect(searchBtnEls[0].type).toBe('button')
    restoreGetCookieFns()
  })

  it('Jobs Route should consist of an HTML main heading element with text content as "Type of Employment":::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      await screen.findByRole('heading', {
        name: /Type of Employment/i,
      }),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('Jobs Route should consist of HTML checkboxes with label text as the values of the key "label" from employmentTypesList provided:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      await screen.findByRole('checkbox', {
        name: employmentTypesList[0].label,
        exact: false,
      }),
    ).toBeInTheDocument()
    for (let index = 1; index < 4; index += 1) {
      const checkboxElIndex = screen.getByRole('checkbox', {
        name: employmentTypesList[index].label,
        exact: false,
      })
      expect(checkboxElIndex).toBeInTheDocument()
    }
    restoreGetCookieFns()
  })

  it('Jobs Route should consist of an HTML main heading element with text content as "Salary Range":::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      await screen.findByRole('heading', {name: /Salary Range/i}),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('Jobs Route should consist of HTML radio buttons and label text as the values of the key "label" from salaryRangesList provided:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      await screen.findByRole('radio', {
        name: salaryRangesList[0].label,
        exact: false,
      }),
    ).toBeInTheDocument()
    for (let index = 1; index < 4; index += 1) {
      expect(
        screen.getByRole('radio', {
          name: salaryRangesList[index].label,
          exact: false,
        }),
      ).toBeInTheDocument()
    }
    restoreGetCookieFns()
  })

  it('When the Jobs Route is opened, it should initially consist of HTML container elements with testid attribute value as "loader":::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    await waitForElementToBeRemoved(() => screen.queryAllByTestId('loader'))
    restoreGetCookieFns()
  })

  it('When the Jobs Route is opened, an HTTP GET request should be made to the given Profile API URL to display the profile details:::5:::', async () => {
    mockGetCookie()
    const mockFetchFunction = jest.fn().mockImplementation(url => {
      if (url === profileApiUrl) {
        return {
          ok: true,
          json: () => Promise.resolve(profileResponse),
        }
      }
      return {
        ok: true,
        json: () => Promise.resolve(jobsResponse),
      }
    })
    window.fetch = mockFetchFunction
    renderWithBrowserRouter(<App />)
    expect(
      mockFetchFunction.mock.calls.some(
        eachCall => eachCall[0] === profileApiUrl,
      ),
    ).toBeTruthy()
    restoreGetCookieFns()
  })

  it('When the Jobs Route is opened, an HTTP GET request should be made to the given Jobs API URL to display the list of jobs:::5:::', async () => {
    mockGetCookie()
    const mockFetchFunction = jest.fn().mockImplementation(url => {
      if (url === profileApiUrl) {
        return {
          ok: true,
          json: () => Promise.resolve(profileResponse),
        }
      }
      return {
        ok: true,
        json: () => Promise.resolve(jobsResponse),
      }
    })
    window.fetch = mockFetchFunction
    renderWithBrowserRouter(<App />)
    expect(
      mockFetchFunction.mock.calls.some(eachCall =>
        eachCall[0].match(jobsApiUrl),
      ),
    ).toBeTruthy()
    restoreGetCookieFns()
  })

  it('When the Jobs Route is opened, an HTTP GET request should be made to the given Jobs API URL with all the query parameters and their initial values as empty strings:::5:::', async () => {
    mockGetCookie()
    const mockFetchFunction = jest.fn().mockImplementation(url => {
      if (url === profileApiUrl) {
        return {
          ok: true,
          json: () => Promise.resolve(profileResponse),
        }
      }
      return {
        ok: true,
        json: () => Promise.resolve(jobsResponse),
      }
    })
    window.fetch = mockFetchFunction
    renderWithBrowserRouter(<App />)
    const jobsApiMockCall = mockFetchFunction.mock.calls.find(eachCall =>
      eachCall[0].match(jobsApiUrl),
    )
    expect(jobsApiMockCall[0]).toMatch('search=')
    expect(jobsApiMockCall[0]).toMatch('employment_type=')
    expect(jobsApiMockCall[0]).toMatch('minimum_package=')
    restoreGetCookieFns()
  })

  it('When the HTTP GET requests in the Jobs Route are successful, then the page should consist of at least four HTML unordered list elements to display nav items, jobs received from the response, employmentTypes and salaryRanges:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    await waitForElementToBeRemoved(() => screen.queryAllByTestId('loader'))
    const unorderedLists = await screen.findAllByRole('list')
    expect(unorderedLists.length).toBeGreaterThanOrEqual(4)
    expect(unorderedLists[0].tagName).toBe('UL')
    restoreGetCookieFns()
  })

  it('When the HTTP GET requests in the Jobs Route are successful, then the page should consist of an HTML image element with alt attribute value as "profile" and src as the value of key "profile_image_url" received from the profile response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const imgEl = await screen.findByRole('img', {
      name: /profile/i,
    })
    expect(imgEl).toBeInTheDocument()
    expect(imgEl.src).toBe(profileResponse.profile_details.profile_image_url)
    restoreGetCookieFns()
  })

  it('When the HTTP GET requests in the Jobs Route are successful, then the page should consist of an HTML main heading element with text content as the values of the key "name" received from the profile response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      await screen.findByRole('heading', {
        name: profileResponse.profile_details.name,
      }),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('When the HTTP GET requests in the Jobs Route are successful, then the page should consist of an HTML paragraph element with text content as the values of the key "short_bio" received from the profile response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const paragraphEl = await screen.findByText(
      profileResponse.profile_details.short_bio,
    )
    expect(paragraphEl).toBeInTheDocument()
    expect(paragraphEl.tagName).toBe('P')
    restoreGetCookieFns()
  })

  it('When the HTTP GET requests in the Jobs Route are successful, then the page should consist of HTML image elements with alt attribute value as "company logo" and src as the values of key "company_logo_url" received from the jobs response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const imgEls = await screen.findAllByRole('img', {
      name: /company logo/i,
    })
    expect(imgEls.length).toBeGreaterThanOrEqual(2)
    expect(imgEls[0].src).toBe(jobsResponse.jobs[0].company_logo_url)
    restoreGetCookieFns()
  })

  it('When the HTTP GET requests in the Jobs Route are successful, then the page should consist of HTML main heading elements with text content as the values of the key "title" received from the jobs response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      await screen.findByRole('heading', {
        name: jobsResponse.jobs[0].title,
        exact: false,
      }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', {
        name: jobsResponse.jobs[1].title,
        exact: false,
      }),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('When the HTTP GET requests in the Jobs Route are successful, then the page should consist of HTML paragraph elements with text content as the value of the key "rating" received from the jobs response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const paragraphEl1 = await screen.findByText(jobsResponse.jobs[0].rating, {
      exact: false,
    })
    expect(paragraphEl1).toBeInTheDocument()
    expect(paragraphEl1.tagName).toBe('P')
    const paragraphEl2 = await screen.findByText(jobsResponse.jobs[1].rating, {
      exact: false,
    })
    expect(paragraphEl2).toBeInTheDocument()
    expect(paragraphEl2.tagName).toBe('P')
    restoreGetCookieFns()
  })

  it('When the HTTP GET requests in the Jobs Route are successful, then the page should consist of HTML paragraph elements with text content as the values of the key "location" received from the jobs response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const paragraphEl1 = await screen.findByText(
      jobsResponse.jobs[0].location,
      {
        exact: false,
      },
    )
    expect(paragraphEl1).toBeInTheDocument()
    expect(paragraphEl1.tagName).toBe('P')
    const paragraphEl2 = await screen.findByText(
      jobsResponse.jobs[1].location,
      {
        exact: false,
      },
    )
    expect(paragraphEl2).toBeInTheDocument()
    expect(paragraphEl2.tagName).toBe('P')
    restoreGetCookieFns()
  })

  it('When the HTTP GET requests in the Jobs Route are successful, then the page should consist of HTML paragraph elements with text content as the values of the key "employment_type" received from the jobs response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      await screen.findByRole('heading', {
        name: profileResponse.profile_details.name,
        exact: false,
      }),
    ).toBeInTheDocument()
    const paragraphEl1 = await screen.findByText(
      jobsResponse.jobs[0].employment_type,
      {
        exact: false,
      },
    )
    expect(paragraphEl1).toBeInTheDocument()
    expect(paragraphEl1.tagName).toBe('P')
    const paragraphEl2 = await screen.findByText(
      jobsResponse.jobs[1].employment_type,
      {
        exact: false,
      },
    )
    expect(paragraphEl2).toBeInTheDocument()
    expect(paragraphEl2.tagName).toBe('P')
    restoreGetCookieFns()
  })

  it('When the HTTP GET requests in the Jobs Route are successful, then the page should consist of HTML main heading elements with text content as the "Description" based on the received jobs response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const headingEls = await screen.findAllByRole('heading', {
      name: /Description/i,
    })
    expect(headingEls.length).toBeGreaterThanOrEqual(2)
    restoreGetCookieFns()
  })

  it('When the HTTP GET requests in the Jobs Route are successful, then the page should consist of HTML paragraph elements with text content as the values of the key "job_description" received from the jobs response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const paragraphEl1 = await screen.findByText(
      jobsResponse.jobs[0].job_description,
      {
        exact: false,
      },
    )
    expect(paragraphEl1).toBeInTheDocument()
    expect(paragraphEl1.tagName).toBe('P')
    const paragraphEl2 = await screen.findByText(
      jobsResponse.jobs[1].job_description,
      {
        exact: false,
      },
    )
    expect(paragraphEl2).toBeInTheDocument()
    expect(paragraphEl2.tagName).toBe('P')
    restoreGetCookieFns()
  })

  it('When a value is provided in the HTML input element for search and search icon button is clicked, an HTTP GET request should be made with the value provided in the search input element as the value to query parameter "search":::5:::', async () => {
    mockGetCookie()
    const mockFetchFunction = jest.fn().mockImplementation(url => {
      if (url === profileApiUrl) {
        return {
          ok: true,
          json: () => Promise.resolve(profileResponse),
        }
      }
      return {
        ok: true,
        json: () => Promise.resolve(jobsResponse),
      }
    })
    window.fetch = mockFetchFunction
    renderWithBrowserRouter(<App />)
    userEvent.type(screen.getAllByRole('searchbox')[0], 'Dev')
    userEvent.click(screen.getAllByTestId('searchButton')[0])
    expect(mockFetchFunction.mock.calls[2][0]).toMatch('search=Dev')
    restoreGetCookieFns()
  })

  it('When employment types are selected, an HTTP GET request should be made with the ids of the employment types as a single string separated by "," as value to query parameter "employment_type":::5:::', async () => {
    mockGetCookie()
    const mockFetchFunction = jest.fn().mockImplementation(url => {
      if (url === profileApiUrl) {
        return {
          ok: true,
          json: () => Promise.resolve(profileResponse),
        }
      }
      return {
        ok: true,
        json: () => Promise.resolve(jobsResponse),
      }
    })
    window.fetch = mockFetchFunction
    renderWithBrowserRouter(<App />)
    userEvent.click(screen.getByLabelText(/Full Time/i))
    userEvent.click(screen.getByLabelText(/Part Time/i))
    expect(mockFetchFunction.mock.calls[3][0]).toMatch(
      'employment_type=FULLTIME,PARTTIME',
    )
    restoreGetCookieFns()
  })

  it('When a salary range is clicked, an HTTP GET request should be made with the id of the salaryRange as value to query parameter "minimum_package":::5:::', async () => {
    mockGetCookie()
    const mockFetchFunction = jest.fn().mockImplementation(url => {
      if (url === profileApiUrl) {
        return {
          ok: true,
          json: () => Promise.resolve(profileResponse),
        }
      }
      return {
        ok: true,
        json: () => Promise.resolve(jobsResponse),
      }
    })
    window.fetch = mockFetchFunction
    renderWithBrowserRouter(<App />)
    userEvent.click(screen.getByLabelText(/10 LPA/i))
    expect(mockFetchFunction.mock.calls[2][0]).toMatch(
      'minimum_package=1000000',
    )
    restoreGetCookieFns()
  })

  it('When all filters are used, an HTTP GET request should be made to jobsApiUrl with all the query parameters and their values:::5:::', async () => {
    mockGetCookie()
    const mockFetchFunction = jest.fn().mockImplementation(url => {
      if (url === profileApiUrl) {
        return {
          ok: true,
          json: () => Promise.resolve(profileResponse),
        }
      }
      return {
        ok: true,
        json: () => Promise.resolve(jobsResponse),
      }
    })
    window.fetch = mockFetchFunction
    renderWithBrowserRouter(<App />)
    userEvent.type(screen.getAllByRole('searchbox')[0], 'Dev')
    userEvent.click(screen.getAllByTestId('searchButton')[0])
    userEvent.click(screen.getByLabelText(/Full Time/i))
    userEvent.click(screen.getByLabelText(/10 LPA/i))
    expect(mockFetchFunction.mock.calls[4][0]).toMatch('search=Dev')
    expect(mockFetchFunction.mock.calls[4][0]).toMatch(
      'employment_type=FULLTIME',
    )
    expect(mockFetchFunction.mock.calls[4][0]).toMatch(
      'minimum_package=1000000',
    )
    restoreGetCookieFns()
  })

  it('When a Job Item is clicked in Jobs Route, then the page should be navigated to the Job Item Details route with "/jobs/:id" as the URL path:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      await screen.findByRole('heading', {
        name: profileResponse.profile_details.name,
        exact: false,
      }),
    ).toBeInTheDocument()
    const headingEl = await screen.findByText(jobsResponse.jobs[0].title, {
      exact: false,
    })
    expect(headingEl).toBeInTheDocument()
    userEvent.click(headingEl)
    expect(window.location.pathname).toMatch('jobs/101')
    restoreGetCookieFns()
  })

  it('When the HTTP GET request made to the given Jobs API URL in the Jobs Route returns the jobs list as empty, then the page should consist of the HTML image element with alt attribute value as "no jobs" and src as the given no jobs view image URL:::5:::', async () => {
    mockGetCookie()
    const mockFetchFunction = jest.fn().mockImplementation(url => {
      if (url === profileApiUrl) {
        return {
          ok: true,
          json: () => Promise.resolve(profileResponse),
        }
      }
      return {
        ok: true,
        json: () => Promise.resolve({jobs: []}),
      }
    })
    window.fetch = mockFetchFunction
    renderWithBrowserRouter(<App />)
    const imgEl = await screen.findByRole('img', {
      name: /no jobs/i,
    })
    expect(imgEl).toBeInTheDocument()
    expect(imgEl.src).toBe(noJobsView)
    restoreGetCookieFns()
  })

  it('When the HTTP GET request made to the given Jobs API URL in the Jobs Route returns the jobs list as empty, then the page should consist of an HTML main heading element with text content as "No Jobs Found":::5:::', async () => {
    mockGetCookie()
    const mockFetchFunction = jest.fn().mockImplementation(url => {
      if (url === profileApiUrl) {
        return {
          ok: true,
          json: () => Promise.resolve(profileResponse),
        }
      }
      return {
        ok: true,
        json: () => Promise.resolve({jobs: []}),
      }
    })
    window.fetch = mockFetchFunction
    renderWithBrowserRouter(<App />)
    expect(
      await screen.findByRole('heading', {name: /No Jobs Found/i}),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('When the HTTP GET request made to the given Jobs API URL in the Jobs Route returns the jobs list as empty, then the page should consist of an HTML paragraph element with text content as "We could not find any jobs. Try other filters":::5:::', async () => {
    mockGetCookie()
    const mockFetchFunction = jest.fn().mockImplementation(url => {
      if (url === profileApiUrl) {
        return {
          ok: true,
          json: () => Promise.resolve(profileResponse),
        }
      }
      return {
        ok: true,
        json: () => Promise.resolve({jobs: []}),
      }
    })
    window.fetch = mockFetchFunction
    renderWithBrowserRouter(<App />)
    const paragraphEl = await screen.findByText(
      /We could not find any jobs*. Try other filters/i,
    )
    expect(paragraphEl).toBeInTheDocument()
    expect(paragraphEl.tagName).toBe('P')
    restoreGetCookieFns()
  })

  it('When the HTTP GET request made to the given Profile API URL in the Jobs Route is unsuccessful, then the page should consist of the HTML button element with text content as the "Retry":::5:::', async () => {
    mockGetCookie()
    server.use(
      rest.get(profileApiUrl, (req, res, ctx) =>
        res(ctx.status(400), ctx.json({message: 'something went wrong'})),
      ),
    )
    renderWithBrowserRouter(<App />)
    expect(
      await screen.findByRole('button', {name: /Retry/i}),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('When the HTTP GET request made to the given Jobs API URL in the Jobs Route is unsuccessful, then the page should consist of the HTML image element with alt as "failure view" and src as the given failure view image URL:::5:::', async () => {
    mockGetCookie()
    server.use(
      rest.get(jobsApiUrl, (req, res, ctx) =>
        res(ctx.status(400), ctx.json({message: 'something went wrong'})),
      ),
    )
    renderWithBrowserRouter(<App />)
    const imgEl = await screen.findByRole('img', {
      name: /failure view/i,
    })
    expect(imgEl).toBeInTheDocument()
    expect(imgEl.src).toBe(errorView)
    restoreGetCookieFns()
  })

  it('When the HTTP GET request made to the given Jobs API URL in the Jobs Route is unsuccessful, then the page should consist of the HTML main heading element with text content as "Oops! Something Went Wrong":::5:::', async () => {
    mockGetCookie()
    server.use(
      rest.get(jobsApiUrl, (req, res, ctx) =>
        res(ctx.status(400), ctx.json({message: 'something went wrong'})),
      ),
    )
    renderWithBrowserRouter(<App />)
    expect(
      await screen.findByRole('heading', {
        name: /Oops*. Something Went Wrong/i,
      }),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('When the HTTP GET request made to the given Jobs API URL in the Jobs Route is unsuccessful, then the page should consist of the HTML paragraph element with text content as "We cannot seem to find the page you are looking for":::5:::', async () => {
    mockGetCookie()
    server.use(
      rest.get(jobsApiUrl, (req, res, ctx) =>
        res(ctx.status(400), ctx.json({message: 'something went wrong'})),
      ),
    )
    renderWithBrowserRouter(<App />)
    const paragraphEl = await screen.findByText(
      /We cannot seem to find the page you are looking for/i,
    )
    expect(paragraphEl).toBeInTheDocument()
    expect(paragraphEl.tagName).toBe('P')
    restoreGetCookieFns()
  })

  it('When the HTTP GET request made to the given Jobs API URL in the Jobs Route is unsuccessful, then the page should consist of the HTML button element with text content as the "Retry":::5:::', async () => {
    mockGetCookie()
    server.use(
      rest.get(jobsApiUrl, (req, res, ctx) =>
        res(ctx.status(400), ctx.json({message: 'something went wrong'})),
      ),
    )
    renderWithBrowserRouter(<App />)
    expect(
      await screen.findByRole('button', {name: /Retry/i}),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('When the HTTP GET request made to the given Profile API URL in the Jobs Route is unsuccessful and the "Retry" button is clicked, then an HTTP GET request should be made to the given Profile API URL:::5:::', async () => {
    mockGetCookie()
    const mockFetchFunction = jest.fn().mockImplementation(url => {
      if (url === profileApiUrl) {
        return {
          ok: false,
          json: () => Promise.resolve({message: 'something went wrong'}),
        }
      }
      return {
        ok: true,
        json: () => Promise.resolve(jobsResponse),
      }
    })
    window.fetch = mockFetchFunction
    renderWithBrowserRouter(<App />)
    const buttonEl = await screen.findByRole('button', {
      name: /Retry/i,
    })
    expect(buttonEl).toBeInTheDocument()
    userEvent.click(buttonEl)
    expect(mockFetchFunction.mock.calls[2][0]).toBe(`${profileApiUrl}`)
    restoreGetCookieFns()
  })

  it('When the HTTP GET request made to the given Jobs API URL in the Jobs Route is unsuccessful and the "Retry" button is clicked, then an HTTP GET request should be made to the given Jobs API URL:::5:::', async () => {
    mockGetCookie()
    const mockFetchFunction = jest.fn().mockImplementation(url => {
      if (url === profileApiUrl) {
        return {
          ok: true,
          json: () => Promise.resolve(profileResponse),
        }
      }
      return {
        ok: false,
        json: () => Promise.resolve({message: 'something went wrong'}),
      }
    })
    window.fetch = mockFetchFunction
    renderWithBrowserRouter(<App />)
    const buttonEl = await screen.findByRole('button', {
      name: /Retry/i,
    })
    expect(buttonEl).toBeInTheDocument()
    userEvent.click(buttonEl)
    expect(mockFetchFunction.mock.calls[2][0]).toMatch(`${jobsApiUrl}`)
    restoreGetCookieFns()
  })

  it('When the website logo in the Header is clicked, then the page should be navigated to Home Route:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const imageEls = await screen.findAllByRole('img', {
      name: /website logo/i,
    })
    userEvent.click(imageEls[0])
    expect(window.location.pathname).toBe(homeRoutePath)
    restoreGetCookieFns()
  })

  it('When the Home link in the Header is clicked, then the page should be navigated to Home Route:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const homeLink = await screen.findAllByRole('link', {
      name: /home/i,
    })
    userEvent.click(homeLink[0])
    expect(window.location.pathname).toBe(homeRoutePath)
    restoreGetCookieFns()
  })
})
