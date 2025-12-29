from flask import Flask
from dotenv import load_dotenv
import os
from flask_cors import CORS


def create_app():
    load_dotenv()

    app = Flask(__name__)

    app.config["ENV"] = os.getenv("FLASK_ENV", "production")
    app.config["DEBUG"] = os.getenv("FLASK_DEBUG") == "1"

    @app.route("/health", methods=["GET"])
    def health():
        return {"status": "ok"}, 200

    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    from app.routes.user import user_bp
    app.register_blueprint(user_bp)

    from app.routes.account import account_bp
    app.register_blueprint(account_bp)

    from app.routes.rss import rss_bp
    app.register_blueprint(rss_bp)



    CORS(app)

    return app
