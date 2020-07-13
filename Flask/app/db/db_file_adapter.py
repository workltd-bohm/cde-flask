from .db_mock import DBMock


class DBFileAdapter:

    @staticmethod
    def connect():
        return DBMock.connect()

    @staticmethod
    def get_table(name):
        return DBMock.get_file(name)

    @staticmethod
    def get_user(identifier):
        return DBMock.get_user(identifier)

    @staticmethod
    def set_user(user):
        return DBMock.set_user(user)
