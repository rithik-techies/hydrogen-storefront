  module.exports = {
    "apps": [
      {
        "name": "api",
        "script": "/var/www/html/hydrogen/main.js",
        "ignore_watch": ["frontend/", ".*"],
        "log_date_format": "YYYY-MM-DD HH:mm",
        "env": {
          "NODE_ENV": "production",
          "PORT": "3000"
        }
      },
      {
      "name": "techies-app",
      "script": "/var/www/html/techiapps/main.js",
      "ignore_watch": ["frontend/", ".*"],
      "log_date_format": "YYYY-MM-DD HH:mm",
      "env": {
        "NODE_ENV": "production",
        "PORT": "3001"
      }
    },
    {
      "name": "review-box",
      "script": "/var/www/html/techiapps/proofly-review/build/server/index.js",
      "ignore_watch": ["frontend/", ".*"],
      "log_date_format": "YYYY-MM-DD HH:mm",
      "env": {
        "NODE_ENV": "production",
        "PORT": "3003"
      }
    },
    {
      "name": "wish-mart-app",
      "script": "/var/www/html/techiapps/wishlist-mart/main.js",
      "ignore_watch": ["frontend/", ".*"],
      "log_date_format": "YYYY-MM-DD HH:mm",
      "env": {
        "NODE_ENV": "production",
        "PORT": "3002"
      }
    }
  ]
}
