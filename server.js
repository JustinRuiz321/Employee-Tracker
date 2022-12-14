const mysql = require('mysql2');
const inquirer = require('inquirer');
//const Connection = require('mysql2/typings/mysql/lib/Connection');
require('dotenv').config();

const sqlConnection = mysql.createConnection({ 
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'employees_db',
    port: 3306
});

sqlConnection.connect((err) => {
    if (err) throw err;
    questions();
});

function questions(){
    inquirer.prompt([
        {
            type : 'list',
            name : 'openingQuestions',
            message : 'Welcome! What are you interested in today?' ,
            choices: ['See my employees currently' , 'Add another employee' , "Update and employee's role" , 'View possible roles' , 'Add a different role' , 'View different departments' , 'Add another department' , 'Finished']
        }
    ])
    .then((answers) => {
        const {openingQuestions} = answers;
        if (openingQuestions === 'See my employees currently') {
            viewEmployees();
        };
        if (openingQuestions === 'Add another employee') {
            addEmployees();
        };
        if (openingQuestions === "Update and employee's role") {
            updateEmployees();
        };
        if (openingQuestions === 'View possible roles') {
            viewRoles();
        };
        if (openingQuestions === 'Add a different role') {
            addRoles();
        };
        if (openingQuestions === 'View different departments') {
            viewDepartments();
        };
        if (openingQuestions === 'Finished') {
            finished();
        };
    });
};

function viewEmployees(){
    const sql = 
    `SELECT 
    employee.id,
    employee.first_name,
    employee.last_name,
    role.title,
    role.salary,
    department.department_name AS department
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id`;

    sqlConnection.query(sql, (err, rows) => {
        console.table(rows);
        if (err) throw err;
        questions();
    });
};

function addEmployees(){
    inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'Please enter the first name of the employee being added'
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'Please enter the last name of the employee being added'
        },
        {
            type: 'input',
            name: 'role',
            message: "What's the employee's role?"
        },
        {
            type: 'input',
            name: 'manager',
            message: "Who is the employee's manager?"
        }
    ])
    .then((answers) => {
        var role_id;
        var manager_id;
        if (answers.role === "null") {
            role_id = null
        } else {
            role_id = parseInt(answers.role)
        }
        if (answers.manager == "null") {
            manager_id = null
        } else {
            manager_id = parseInt(answers.manager)
        }
        sqlConnection.query(
            `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`,
            [answers.first_name, answers.last_name, role_id, manager_id], (err , answers) => {
                console.table(answers);
                if (err) throw err;
                questions();
            }
        );
    });
};

function updateEmployees(){
    const sql = 
    `SELECT employee.id,
    employee.first_name,
    employee.last_name
    FROM employee`;

    const employeeRole =
    `SELECT role.id,
    role.title
    FROM role`;

    sqlConnection.query(sql, (err , rows) => {
        var array = []
        var arrayRole = []
        rows.forEach((tacocat, i) => {
            array.push(`${tacocat.first_name} ${tacocat.last_name}`)
        });
        if (err) throw err ;

        sqlConnection.query(employeeRole, (err, rows) => {
            rows.forEach((mousetrap, i) => {
                arrayRole.push(`${mousetrap.title}`)
            })
            if (err) throw err;
        });

        inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: 'Which employee needs to be updated?',
                choices: array,
            },
            {
                type: 'list',
                name: 'employeeRole',
                message: 'Assign the new ID to the employee.',
                choices: arrayRole
            }
        ])
            .then((answers) => {
                sqlConnection.query("UPDATE employee SET role_id = ? WHERE id = ?" ,
                [answers.employee, answers.employeeRole], (err, answers) => {
                    console.table(answers);
                    if (err) throw err;
                    questions();
                });
            });
    });
};

function viewRoles(){
    const sql =
    `SELECT role.id,
    role.title,
    department.department_name AS department,
    role.salary FROM role LEFT JOIN department ON role.department_id = department.id`;

    sqlConnection.query(sql, (err, rows) => {
        console.table(rows);
        if (err) throw err;
        questions();
    });
};

function addRoles(){
    inquirer.prompt([
        {
            type: 'input',
            name: 'role',
            message: 'What role would you like to add?'
        },
        {
            type: 'input',
            name: 'roleSalary',
            message: 'Name the salary of this role'
        }
    ])
    .then((answers) => {
        const sql =
        `SELECT role.id,
        role.title,
        role.salary`;

        sqlConnection.query("INSERT INTO role (title,salary) VALUES (?,?)", 
        [answers.role, answers.roleSalary], (err, answers) => {
            console.table(answers);
            if (err) throw err;
            questions();
        })
    });
};

function viewDepartments(){
    const sql =
    `SELECT department.id,
    department.department_name AS department FROM department`;

    sqlConnection.query(sql, (err, rows) => {
        console.table(rows);
        if (err) throw err;
        questions();
    });
};


function finished(){
    console.log("Goodbye!");
    sqlConnection.end();
}