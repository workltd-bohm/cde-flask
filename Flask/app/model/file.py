class File:

    def __init__(self, file_id, name, type, directory, file_history):
        self._name = name
        self._type = type
        self._directory = directory
        self._file_history = file_history

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        self._name = value

    @property
    def type(self):
        return self._type

    @type.setter
    def type(self, value):
        self._type = value

    @property
    def directory(self):
        return self._directory

    @directory.setter
    def directory(self, value):
        self._directory = value

    @property
    def file_history(self):
        return self._file_history

    @file_history.setter
    def file_history(self, value):
        self._file_history = value
