import os
from dotenv import load_dotenv
from datetime import timedelta

env = os.getenv('FLASK_ENV', 'development')
env_file = os.path.join(os.path.dirname(__file__), f".env.{env}")
load_dotenv(env_file)

class Config:
    SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    JWT_BLACKLIST_ENABLED = True
    DATABASE_URL = os.getenv('DATABASE_URL').replace('sqlite:///', 'sqlite:///path/to/your/database.db')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS').split(',') if os.getenv('CORS_ORIGINS') else []
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_REGION = os.getenv('AWS_REGION')

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig
}
