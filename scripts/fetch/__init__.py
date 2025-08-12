"""
Data Fetching Module
Contains all data fetchers for different APIs
"""

from .base import BaseFetcher
from .ssb import SSBFetcher
from .norges_bank import NorgesBankFetcher

__all__ = ['BaseFetcher', 'SSBFetcher', 'NorgesBankFetcher']
