class Directory:

    def __init__(self, dir_id, name, parent_directory, files):
        self._dir_id = dir_id
        self._name = name
        self._parent_directory = parent_directory
        self._files = files

    @property
    def dir_id(self):
        return self._dir_id

    @dir_id.setter
    def dir_id(self, value):
        self._dir_id = value

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        self._name = value

    @property
    def parent_directory(self):
        return self._parent_directory

    @parent_directory.setter
    def parent_directory(self, value):
        self._parent_directory = value

    @property
    def files(self):
        return self._files

    @files.setter
    def files(self, value):
        self._files = value

