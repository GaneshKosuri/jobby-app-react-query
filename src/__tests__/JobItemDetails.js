import {BrowserRouter} from 'react-router-dom'
import Cookies from 'js-cookie'
import {setupServer} from 'msw/node'
import {rest} from 'msw'

import {render, screen, waitForElementToBeRemoved} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from '../App'

const jobItemDetailsRoutePath = '/jobs/101'
const loginRoutePath = '/login'
const jobDetailsTestApiUrl = 'https://apis.ccbp.in/jobs/101'
const jobDetailsApiUrl = 'https://apis.ccbp.in/jobs/:id'
const websiteLogo = 'https://assets.ccbp.in/frontend/react-js/logo-img.png'
const errorView = 'https://assets.ccbp.in/frontend/react-js/failure-img.png'

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
        'https://assets.ccbp.in/frontend/react-js/jobby-app/facebook-img.png',
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
        'https://assets.ccbp.in/frontend/react-js/jobby-app/swiggy-img.png',
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
        'https://assets.ccbp.in/frontend/react-js/jobby-app/zomato-img.png',
      location: 'HYDERABAD',
      employment_type: 'INTERNSHIP',
      job_description: '109 some random description',
      rating: 218,
    },
  ],
}

const server = setupServer(
  rest.get(jobDetailsApiUrl, (req, res, ctx) =>
    res(ctx.json(jobDetailsResponse)),
  ),
)
const mockGetCookie = (returnToken = true) => {
  let mockedGetCookie
  if (returnToken) {
    mockedGetCookie = jest.fn(() => ({
      jwt_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJhaHVsIiwicm9sZSI6IlBSSU1FX1VTRVIiLCJpYXQiOjE2MTk2Mjg2MTN9.nZDlFsnSWArLKKeF0QbmdVfLgzUbx1BGJsqa2kc_21Y',
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

const renderWithBrowserRouter = (
  ui,
  {route = jobItemDetailsRoutePath} = {},
) => {
  window.history.pushState({}, 'Test page', route)
  return render(ui, {wrapper: BrowserRouter})
}
const originalConsoleError = console.error
const originalFetch = window.fetch

describe('Job Item Details Route tests', () => {
  beforeAll(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    console.error = originalConsoleError
    window.fetch = originalFetch
  })

  afterAll(() => {
    server.close()
  })

  it('When HTTP GET request in the Job Item Details Route is successful, then the page should consist of at least two HTML list items and the skills list and similar jobs list received from the response should be rendered using a unique key as a prop to display each skill and similar job respectively:::5:::', async () => {
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
    await waitForElementToBeRemoved(() => screen.queryByTestId('loader'))
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(2)
    restoreGetCookieFns()
  })

  it('When "/jobs/:id" is provided as the URL path by an unauthenticated user, then the page should be navigated to the Login Route and consist of an HTML button element with text content as "Login":::5:::', () => {
    mockGetCookie(false)
    renderWithBrowserRouter(<App />)
    expect(window.location.pathname).toBe(loginRoutePath)
    const loginButton = screen.getByRole('button', {
      name: /Login/i,
    })
    expect(loginButton).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('Job Item Details Route should consist of an HTML image element with alt attribute value as "website logo" and src as the given website logo image URL:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const imageEls = await screen.findAllByRole('img', {
      name: /website logo/i,
    })
    expect(imageEls[0]).toBeInTheDocument()
    expect(imageEls[0].src).toBe(websiteLogo)
    restoreGetCookieFns()
  })

  it('When the Job Item Details Route is opened, it should initially consist of an HTML container element with testid attribute value as "loader":::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    await waitForElementToBeRemoved(() => screen.queryByTestId('loader'))
    restoreGetCookieFns()
  })

  it('When the Job Item Details Route is opened, an HTTP GET request should be made to the given Job Details API URL with the job id as the path parameter:::5:::', () => {
    mockGetCookie()
    const mockFetchFunction = jest.fn().mockImplementation(() => ({
      ok: true,
      json: () => Promise.resolve(jobDetailsResponse),
    }))
    window.fetch = mockFetchFunction
    renderWithBrowserRouter(<App />)
    expect(mockFetchFunction.mock.calls[0][0]).toMatch(jobDetailsTestApiUrl)
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of an HTML image element with alt attribute value as "job details company logo" and src as the value of key "company_logo_url" in job_details received from the job details response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const imgEl = await screen.findByRole('img', {
      name: /job details company logo/i,
    })
    expect(imgEl).toBeInTheDocument()
    expect(imgEl.src).toBe(jobDetailsResponse.job_details.company_logo_url)
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of an HTML image element with text content as the value of the key "title" in job_details received from the job details response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const headingEl = await screen.findByRole('heading', {
      name: jobDetailsResponse.job_details.title,
      exact: false,
    })
    expect(headingEl).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of an HTML paragraph element with text content as the value of the key "rating" in job_details received from the job details response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const paragraphEl = await screen.findByText(
      jobDetailsResponse.job_details.rating,
      {
        exact: false,
      },
    )
    expect(paragraphEl).toBeInTheDocument()
    expect(paragraphEl.tagName).toBe('P')
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of an HTML paragraph element with text content as the value of the key "location" in job_details received from the job details response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const paragraphEl = await screen.findByText(
      jobDetailsResponse.job_details.location,
      {
        exact: false,
      },
    )
    expect(paragraphEl).toBeInTheDocument()
    expect(paragraphEl.tagName).toBe('P')
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of an HTML paragraph element with text content as the value of the key "employment_type" in job_details received from the job details response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const paragraphEl = await screen.findByText(
      jobDetailsResponse.job_details.employment_type,
      {
        exact: false,
      },
    )
    expect(paragraphEl).toBeInTheDocument()
    expect(paragraphEl.tagName).toBe('P')
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of an HTML paragraph element with text content as the value of the key "package_per_annum" in job_details received from the job details response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const paragraphEl = await screen.findByText(
      jobDetailsResponse.job_details.package_per_annum,
      {
        exact: false,
      },
    )
    expect(paragraphEl).toBeInTheDocument()
    expect(paragraphEl.tagName).toBe('P')
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of at least four HTML main heading elements with text content as "Description":::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const headingEl = await screen.findAllByRole('heading', {
      name: /Description/i,
    })
    expect(headingEl.length).toBeGreaterThanOrEqual(4)
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of an HTML paragraph element with text content as the value of the key "job_description" in job_details received from the job details response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const paragraphEl = await screen.findByText(
      jobDetailsResponse.job_details.job_description,
      {
        exact: false,
      },
    )
    expect(paragraphEl).toBeInTheDocument()
    expect(paragraphEl.tagName).toBe('P')
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of an HTML anchor element with href attribute value of the key "company_website_url" and text content as "Visit":::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const linkEl = await screen.findByRole('link', {name: /Visit/})
    expect(linkEl).toBeInTheDocument()
    expect(linkEl).toHaveAttribute(
      'href',
      jobDetailsResponse.job_details.company_website_url,
    )
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of an HTML main heading element with text content as "Skills":::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      await screen.findByRole('heading', {
        name: /Skills/i,
      }),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of at least three HTML unordered list elements to display nav item, skills and similar jobs received from the response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      await screen.findByText(jobDetailsResponse.job_details.title, {
        exact: false,
      }),
    ).toBeInTheDocument()
    const unorderedLists = screen.getAllByRole('list')
    expect(unorderedLists.length).toBeGreaterThanOrEqual(3)
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of HTML image elements with alt attribute value as the values of the key "name" and src as the values of the key "image_url" in the "skills" list received from the job details response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const skillEl1 = await screen.findByRole('img', {
      name: jobDetailsResponse.job_details.skills[0].name,
      exact: false,
    })
    expect(skillEl1).toBeInTheDocument()
    expect(skillEl1.src).toBe(
      jobDetailsResponse.job_details.skills[0].image_url,
    )
    const skillEl2 = screen.getByRole('img', {
      name: jobDetailsResponse.job_details.skills[1].name,
      exact: false,
    })
    expect(skillEl2).toBeInTheDocument()
    expect(skillEl2.src).toBe(
      jobDetailsResponse.job_details.skills[1].image_url,
    )
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of an HTML main heading element with text content as "Life at Company":::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      await screen.findByRole('heading', {
        name: /Life at Company/i,
      }),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of an HTML paragraph element with text content as the value of the key "description" in "life_at_company" from job details response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const paragraphEl = await screen.findByText(
      jobDetailsResponse.job_details.life_at_company.description,
      {
        exact: false,
      },
    )
    expect(paragraphEl).toBeInTheDocument()
    expect(paragraphEl.tagName).toBe('P')
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of an HTML image element with alt attribute value as "life at company" and src as the value of the key "image_url" in "life_at_company" from job details response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const imgEl = await screen.findByRole('img', {
      name: /life at company/i,
    })
    expect(imgEl).toBeInTheDocument()
    expect(imgEl.src).toBe(
      jobDetailsResponse.job_details.life_at_company.image_url,
    )
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of an HTML main heading element with text content as "Similar Jobs":::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      await screen.findByRole('heading', {
        name: /Similar Jobs/i,
      }),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of HTML image elements with alt attribute value as "similar job company logo" and src as the values of the key "company_logo_url" in similar_jobs received from the job details response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const imgEls = await screen.findAllByRole('img', {
      name: /similar job company logo/i,
    })
    expect(imgEls.length).toBeGreaterThanOrEqual(3)
    for (let index = 0; index < 3; index += 1) {
      expect(imgEls[index].src).toBe(
        jobDetailsResponse.similar_jobs[index].company_logo_url,
      )
    }
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of HTML main heading elements with text content as the values of the key "title" in similar_jobs received from the job details response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      await screen.findByRole('heading', {
        name: jobDetailsResponse.similar_jobs[0].title,
        exact: false,
      }),
    ).toBeInTheDocument()
    for (let index = 1; index < 3; index += 1) {
      expect(
        screen.getByRole('heading', {
          name: jobDetailsResponse.similar_jobs[index].title,
          exact: false,
        }),
      ).toBeInTheDocument()
    }
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of HTML paragraph elements with text content as the values of the key "rating" in similar_jobs received from the job details response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const ratingEl1 = await screen.findByText(
      jobDetailsResponse.similar_jobs[0].rating,
      {
        exact: false,
      },
    )
    expect(ratingEl1).toBeInTheDocument()
    for (let index = 1; index < 3; index += 1) {
      const ratingElIndex = screen.getByText(
        jobDetailsResponse.similar_jobs[index].rating,
        {
          exact: false,
        },
      )
      expect(ratingElIndex).toBeInTheDocument()
      expect(ratingElIndex.tagName).toBe('P')
    }
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of HTML paragraph elements with text content as the value of the key "location" in similar_jobs received from the job details response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const paragraphEl1 = await screen.findByText(
      jobDetailsResponse.similar_jobs[0].location,
      {
        exact: false,
      },
    )
    expect(paragraphEl1).toBeInTheDocument()
    expect(paragraphEl1.tagName).toBe('P')
    for (let index = 1; index < 3; index += 1) {
      const paragraphElIndex = screen.getByText(
        jobDetailsResponse.similar_jobs[index].location,
        {
          exact: false,
        },
      )
      expect(paragraphElIndex).toBeInTheDocument()
      expect(paragraphElIndex.tagName).toBe('P')
    }
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of HTML paragraph elements with text content as the value of the key "employment_type" in similar_jobs received from the job details response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const paragraphEl1 = await screen.findByText(
      jobDetailsResponse.similar_jobs[0].employment_type,
      {
        exact: false,
      },
    )
    expect(paragraphEl1).toBeInTheDocument()
    expect(paragraphEl1.tagName).toBe('P')
    for (let index = 1; index < 3; index += 1) {
      const paragraphElIndex = screen.getByText(
        jobDetailsResponse.similar_jobs[index].employment_type,
        {
          exact: false,
        },
      )
      expect(paragraphElIndex).toBeInTheDocument()
      expect(paragraphElIndex.tagName).toBe('P')
    }
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is successful, then the page should consist of HTML paragraph elements with text content as the value of the key "job_description" in similar_jobs received from the job details response:::5:::', async () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const paragraphEl1 = await screen.findByText(
      jobDetailsResponse.similar_jobs[0].job_description,
      {
        exact: false,
      },
    )
    expect(paragraphEl1).toBeInTheDocument()
    expect(paragraphEl1.tagName).toBe('P')
    for (let index = 1; index < 3; index += 1) {
      const paragraphElIndex = screen.getByText(
        jobDetailsResponse.similar_jobs[index].job_description,
        {
          exact: false,
        },
      )
      expect(paragraphElIndex).toBeInTheDocument()
      expect(paragraphElIndex.tagName).toBe('P')
    }
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is unsuccessful, then the page should consist of an HTML image element with alt attribute value as "failure view" and src as the given failure view image URL:::5:::', async () => {
    mockGetCookie()
    server.use(
      rest.get(jobDetailsApiUrl, (req, res, ctx) =>
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

  it('When the HTTP GET request in the Job Item Details Route is unsuccessful, then the page should consist of an HTML main heading element with text content as "Oops! Something Went Wrong":::5:::', async () => {
    mockGetCookie()
    server.use(
      rest.get(jobDetailsApiUrl, (req, res, ctx) =>
        res(ctx.status(400), ctx.json({message: 'something went wrong'})),
      ),
    )
    renderWithBrowserRouter(<App />)
    const headingEl = await screen.findByRole('heading', {
      name: /Oops*. Something Went Wrong/i,
    })
    expect(headingEl).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is unsuccessful, then the page should consist of an HTML paragraph element with text content as "We cannot seem to find the page you are looking for":::5:::', async () => {
    mockGetCookie()
    server.use(
      rest.get(jobDetailsApiUrl, (req, res, ctx) =>
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

  it('When the HTTP GET request in the Job Item Details Route is unsuccessful, then the page should consist of an HTML button element with text content as "Retry":::5:::', async () => {
    mockGetCookie()
    server.use(
      rest.get(jobDetailsApiUrl, (req, res, ctx) =>
        res(ctx.status(400), ctx.json({message: 'something went wrong'})),
      ),
    )
    renderWithBrowserRouter(<App />)
    expect(
      await screen.findByRole('button', {name: /Retry/i}),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('When the HTTP GET request in the Job Item Details Route is unsuccessful and the "Retry" button is clicked, then an HTTP GET request should be made to the given Job Details API URL:::5:::', async () => {
    mockGetCookie()
    const mockFetchFunction = jest.fn().mockImplementation(() => ({
      ok: false,
      json: () => Promise.resolve({}),
    }))
    window.fetch = mockFetchFunction
    renderWithBrowserRouter(<App />)
    const buttonEl = await screen.findByRole('button', {
      name: /Retry/i,
    })
    expect(buttonEl).toBeInTheDocument()
    userEvent.click(buttonEl)
    expect(mockFetchFunction.mock.calls[1][0]).toBe(`${jobDetailsTestApiUrl}`)
    restoreGetCookieFns()
  })
})
