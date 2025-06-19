#!/usr/bin/env python3
import os
import sys
import json
import subprocess
import importlib

class LanguageHandler:
    @staticmethod
    def detect_language(submission_path):
        """Detect programming language based on file extension"""
        ext = os.path.splitext(submission_path)[1]
        handlers = {
            '.py': 'python',
            '.java': 'java',
            '.c': 'c',
            '.cpp': 'cpp'
        }
        return handlers.get(ext, 'unknown')

    @staticmethod
    def run_python_tests(submission_path):
        """Run Python tests using pytest"""
        try:
            result = subprocess.run(
                ['pytest', '/input', '-v', '--json-report'], 
                capture_output=True, 
                text=True
            )
            return result
        except Exception as e:
            return None

    @staticmethod
    def run_java_tests(submission_path):
        """Run Java tests"""
        try:
            result = subprocess.run(
                ['mvn', 'test', '-f', submission_path], 
                capture_output=True, 
                text=True
            )
            return result
        except Exception as e:
            return None

    @staticmethod
    def run_c_tests(submission_path):
        """Run C/C++ tests"""
        try:
            # Assumes CMake is set up for testing
            os.makedirs('/build', exist_ok=True)
            os.chdir('/build')
            result = subprocess.run(
                ['cmake', '/input', '&&', 'make', '&&', 'ctest'], 
                capture_output=True, 
                text=True, 
                shell=True
            )
            return result
        except Exception as e:
            return None

def run_tests(submission_path):
    """
    Run tests based on detected language
    """
    language = LanguageHandler.detect_language(submission_path)
    
    # Dictionary mapping languages to test runners
    test_runners = {
        'python': LanguageHandler.run_python_tests,
        'java': LanguageHandler.run_java_tests,
        'c': LanguageHandler.run_c_tests,
        'cpp': LanguageHandler.run_c_tests
    }
    
    # Run appropriate test
    runner = test_runners.get(language)
    if not runner:
        raise ValueError(f"Unsupported language: {language}")
    
    result = 