import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getLandingPage(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Currency Converter</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            color: #fff;
            text-align: center;
          }
          h1 { font-size: 3rem; margin-bottom: 1rem; }
          p { font-size: 1.2rem; }
          a {
            display: inline-block;
            margin-top: 1.5rem;
            padding: 0.8rem 1.5rem;
            background: #ffdd57;
            color: #000;
            font-weight: bold;
            text-decoration: none;
            border-radius: 0.5rem;
            transition: transform 0.2s;
          }
          a:hover { transform: scale(1.05); }
          footer {
            position: absolute;
            bottom: 1rem;
            width: 100%;
            text-align: center;
            font-size: 0.9rem;
            color: #ddd;
          }
        </style>
      </head>
      <body>
        <div>
          <h1>Welcome to Currency Converter</h1>
          <p>Convert any currency dynamically using our API.</p>
          <a href="/api/docs">API Documentation →</a>
        </div>
        <footer>
          Developed by Faizan Ali
        </footer>
      </body>
      </html>
    `;
  }
}
