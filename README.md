# Fut API Service

This is a TypeScript Express API service that provides information about football teams. The API allows you to fetch details of a football team by its ID. It has its own database to enhance perfomance and its seeded with info from [http://football-data.org/v4](http://football-data.org/v4). The service is hosted on Vercel and includes Swagger documentation for easy API exploration.

## Features

- **Fetch Football Team by ID:** Retrieve detailed information about a specific football team.
- **Swagger Documentation:** Interactive API documentation to explore and test endpoints.
- **Hosted on Vercel:** Accessible via the Vercel deployment.

## API Endpoints

- **GET /teams/:id**
  - Retrieves detailed information about a football team by its ID.
  - **Parameters:**
    - `id` (number): The unique identifier of the football team.
      Note: The API database supports 1000 teams, so team ids can range from 1 to 1000.

## Swagger Documentation

- Access the Swagger documentation at [https://fut-api.vercel.app/api-docs](https://fut-api.vercel.app/api-docs).
- Use the interactive interface to explore the available endpoints and test the API.

## Deployment

The API is deployed on Vercel and can be accessed live at the link bellow. Please note that interactions with the API are only possible via Swagger; any requests made outside of Swagger will be blocked by CORS:

- [https://fut-api.vercel.app/](https://fut-api.vercel.app/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, you can reach out via:

- Email: vitor.pr04@hotmail.com
- GitHub: [v1tor2003](https://github.com/v1tor2003)
