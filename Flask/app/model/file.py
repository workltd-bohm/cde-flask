from .information_container import IC


class File(IC):

    def __init__(self, file_id, name, directory, file_history, type):
        super.__init__(file_id, name, directory, file_history, files=None)
        self._type = type

    @property
    def type(self):
        return self._type

    @type.setter
    def type(self, value):
        self._type = value


