from logging.handlers import TimedRotatingFileHandler
import logging


class Logger(object):
    instance = None

    def __new__(cls):
        if not Logger.instance:
            Logger.instance = Logger.__Logger()
        return Logger.instance

    class __Logger:

        def __init__(self):
            self.LOG_LEVEL = 20
            self.FILE_NAME = 'logs/bohm.log'
            self._logger = None

        CRITICAL = 50
        FATAL = CRITICAL
        ERROR = 40
        WARNING = 30
        WARN = WARNING
        INFO = 20
        DEBUG = 10
        NOTSET = 0

        _levelToName = {
            CRITICAL: 'CRITICAL',
            ERROR: 'ERROR',
            WARNING: 'WARNING',
            INFO: 'INFO',
            DEBUG: 'DEBUG',
            NOTSET: 'NOTSET',
        }

        _nameToLevel = {
            'CRITICAL': CRITICAL,
            'FATAL': FATAL,
            'ERROR': ERROR,
            'WARN': WARNING,
            'WARNING': WARNING,
            'INFO': INFO,
            'DEBUG': DEBUG,
            'NOTSET': NOTSET,
        }

        def set_logging(self, log_level, file_name=None):
            if not file_name:
                file_name = self.FILE_NAME
            # self.LOG_LEVEL = self._nameToLevel[log_level]
            self.LOG_LEVEL = log_level
            self._logger = logging.getLogger("Rotating Log")
            self._logger.setLevel(self.LOG_LEVEL)

            if self.LOG_LEVEL == 10:
                handler = TimedRotatingFileHandler(file_name, when="s", interval=3600, backupCount=10)

                formatter = logging.Formatter('T:%(asctime)s   LL:%(levelname)s   F:%(funcName)s    LN:%(lineno)d        M:%(message)s')
                handler.setFormatter(formatter)
                self._logger.addHandler(handler)
            else:
                logging.basicConfig(format='T:%(asctime)s   LL:%(levelname)s   F:%(funcName)s    LN:%(lineno)d        M:%(message)s', level=self.LOG_LEVEL)

        def get_logger(self):
            return self._logger
