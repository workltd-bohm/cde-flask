class IC:

    def __init__(self, ic_id, name, parent, history, files=None):
        self._ic_id = ic_id
        self._name = name
        self._parent = parent
        self._history = history
        self._files = files

    @property
    def ic_id(self):
        return self._ic_id

    @ic_id.setter
    def ic_id(self, value):
        self._ic_id = value

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        self._name = value

    @property
    def parent(self):
        return self._parent

    @parent.setter
    def parent(self, value):
        self._parent = value

    @property
    def history(self):
        return self._history

    @history.setter
    def history(self, value):
        self._history = value

    @property
    def files(self):
        return self._files

    @files.setter
    def files(self, value):
        self._files = value
