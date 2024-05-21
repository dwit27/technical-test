import dotenv from "dotenv";
import express from "express";

import axios from 'axios';

dotenv.config();

const port = process.env.SERVER_PORT;

const app = express();

// Define interface for Employee data
interface Employee {
    id: string;
    first_name: string; // firstName
    last_name: string; // lastName
    name: string; // firstName + lastName
    display_name: string; // preferredName or  nickname
    date_of_birth?: Date; // dateOfBirth
    avatar_url?: string;
    personal_phone_number: string; // homePhone or mobilePhone
    work_email: string; // workEmail
    job_title?: string; // jobTitle
    department: string; // department
    hire_date?: Date; // hireDate or originalHireDate
    tenure?: number; // work out from hire date to todays date
    work_anniversary?: Date;
    employments: Employment[];
}

interface Employment {
    start_date: number;
    title: number;
    manager_id: string;
    name?: string;
    job_title?: string;
  }

// function to fetch manager details - unfortunately I can not find managerID field in the API to make this work
function addManagerDetails(employee: Employee){
    for (const element of employee.employments as Employee["employments"]){
        const getManagerDetails= {
            method: 'GET',
            url: `https://api.bamboohr.com/api/gateway.php/dwhittington/v1/employees/${element.manager_id}/?fields=firstName,lastName,jobTitle`,
            headers: {accept: 'application/json', authorization: `Basic ${process.env.BAMBOO_API_KEY}`}
        }
        axios.request(getManagerDetails)
            .then(function (response: { data: any; }) {
                // tslint:disable-next-line:no-console
                console.log(response.data);
                // Update employee object
                element.name = `response.data.firstName response.data.lastName`;
                element.job_title = response.data.jobTitle;
            })
            .catch(function (error: any) {
                // tslint:disable-next-line:no-console
                console.error(error);
            });
    }
}

// calculate the difference in years between the employee start date and current date to find Tenure
function getYearsBetween(givenDate: Date): number {
    const currentDate = new Date();
    const hireDate = new Date(givenDate);

    // Get the difference in milliseconds
    const diffInMs = currentDate.getTime() - hireDate.getTime();

    // Convert milliseconds to days
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Calculate approximate years
    return Math.floor(days / 365); // Could adjust for leap years if needed
}

// set the work anniversay to the day the employee started but change it to be the current year
function setWorkAnniversay(date: Date): Date {
    const currentDate = new Date(date);
    const currentYear = new Date().getFullYear();
    currentDate.setFullYear(currentYear);
    return currentDate;
}

// fields to fetch from the Employee API endpoint
const fields = "firstName,lastName,hireDate,jobTitle,department,workEmail,mobilePhone,dateOfBirth,preferredName"

// Improvement would be to replace the Employee env variable with an input on the page for users to enter an Employee ID
const getEmployeeInfo = {
    method: 'GET',
    url: `https://api.bamboohr.com/api/gateway.php/${process.env.BAMBOO_COMPANY}/v1/employees/${process.env.BAMBOO_EMPLOYEE}/?fields=${fields}&onlyCurrent=true`,
    headers: {accept: 'application/json', authorization: `Basic ${process.env.BAMBOO_API_KEY}`}
  };

const getEmployeeAvatar= {
    method: 'GET',
    url: `https://api.bamboohr.com/api/gateway.php/${process.env.BAMBOO_COMPANY}/v1/employees/${process.env.BAMBOO_EMPLOYEE}/photo/xs`,
    headers: {accept: 'application/json', authorization: `Basic ${process.env.BAMBOO_API_KEY}`}
  };

const getEmployeeJobList= {
    method: 'GET',
    url: `https://api.bamboohr.com/api/gateway.php/${process.env.BAMBOO_COMPANY}/v1/employees/${process.env.BAMBOO_EMPLOYEE}/tables/jobInfo`,
    headers: {accept: 'application/json', authorization: `Basic ${process.env.BAMBOO_API_KEY}`}
  };



// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    // res.send( "Hello world!" );
    axios.request(getEmployeeInfo)
        .then(function (response: { data: any; }) {
            // tslint:disable-next-line:no-console
            console.log(response.data);

            const employee = {
                id: response.data.id,
                first_name: response.data.firstName,
                last_name: response.data.lastName,
                name: response.data.firstName + ' ' + response.data.lastName,
                display_name: response.data.preferredName,
                date_of_birth: response.data.dateOfBirth,
                personal_phone_number: response.data.mobilePhone,
                work_email: response.data.workEmail,
                job_title: response.data.jobTitle,
                department: response.data.department,
                hire_date: response.data.hireDate,
                tenure: getYearsBetween(response.data.hireDate),
                work_anniversary: setWorkAnniversay(response.data.hireDate),
                avatar_url: "",
                employments: [] as object[]
            }
            // couldn't find an appropriate end point or API call to get the URL of the avatar
            // axios.request(getEmployeeAvatar)
            //     .then(function (response: { data: any; }) {
            //         // tslint:disable-next-line:no-console
            //         console.log(response.data);
            //         employee.avatar_url = response.data
            //     })
            //     .catch(function (error: any) {
            //         // tslint:disable-next-line:no-console
            //         console.error(error);
            //     });
            axios.request(getEmployeeJobList)
                .then(function (response: { data: any; }) {
                    // tslint:disable-next-line:no-console
                    console.log(response.data);
                    for (const job of response.data) {
                        const employment = {
                            start_date: job.date,
                            title: job.jobTitle,
                            manager_id: job.reportsTo, // manager ID does not exist in my trial version
                        }
                        employee.employments.push(employment);
                    }
                    res.send( JSON.stringify(employee) );
                })
                .catch(function (error: any) {
                    // tslint:disable-next-line:no-console
                    console.error(error);
                });

        })
        .catch(function (error: any) {
            // tslint:disable-next-line:no-console
            console.error(error);
        });

} );

// start the Express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );




