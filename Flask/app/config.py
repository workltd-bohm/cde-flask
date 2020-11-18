class Basic:
    """
    Basic config.
    """

    PORT = 80

    # from db.db_file_adapter import DBFileAdapter
    # DB = DBFileAdapter()

    from app.db.db_mongo_adapter import DBMongoAdapter
    DB = DBMongoAdapter()

    SECRET_KEY = "key"
    DEBUG = False

    LOG_LEVEL = 10
    LOG_FILE = 'app/logs/bohm.log'

# Here production, staging, development, testing config classes could be made


config = {
    "basic": Basic
}
