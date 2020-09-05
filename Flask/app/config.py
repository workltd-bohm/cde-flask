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
    DEBUG = True

# Here production, staging, development, testing config classes could be made

config = {
    "basic": Basic
}
