Stackone Technical Take home test

Description

This Node.js project fetches employee information from a BambooHR API and processes it to create a comprehensive employee object. It includes details such as:

Basic information (name, department, job title)
Contact details (work email, phone number)
Employment history (start dates, titles)
Tenure (years with the company)
Work anniversary (adjusted to the current year)

Features

Fetches employee data from BambooHR using environment variables for secure API credentials.
Processes the data to create a structured Employee object with mapped fields.
Calculates tenure based on the employee's hire date.
Sets the work anniversary to the employee's start date in the current year.
Attempts to fetch an employee avatar URL (currently commented out due to API limitations).
Provides an endpoint to retrieve the processed employee information as JSON.

Installation

Clone this repository.

Install required dependencies:

Bash
npm install


Create a .env file in the project root directory and set the following environment variables:

SERVER_PORT: The port on which the server will listen (default: 3000).
BAMBOO_COMPANY: Your BambooHR company subdomain.
BAMBOO_EMPLOYEE: The ID of the employee you want to retrieve information for.
BAMBOO_API_KEY: Your BambooHR API key (obtained from your account settings).
Usage

Start the server:

Bash
npm run start

Access the employee information endpoint:

Bash
 http://localhost:8080/  

The response will be a JSON object representing the employee data.

Limitations

Currently, the code cannot fetch the employee's manager details due to missing data in the free trial version of BambooHR. 
The code attempts to fetch an employee avatar URL but is commented out due to API limitations. 

Future Improvements

Implement error handling for API calls to provide more informative messages.
Add validation for environment variables to ensure they are set correctly.
Consider using a templating engine to format the JSON response for better readability.
