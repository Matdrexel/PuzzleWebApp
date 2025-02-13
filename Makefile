# Compiler to use.
CXX = c++

# Compiler flags:
# -O2          : Optimization level 2.
# -Wall        : Enable most compiler warnings.
# -shared      : Create a shared library.
# -fPIC        : Generate position-independent code (required on Unix-like systems).
CXXFLAGS = -O2 -Wall -shared -fPIC
LDFLAGS =

# Target name. On Windows, we want a .dll.
TARGET = main/sortballs.so

# Source files.
SOURCE_FOLD = ballsort_app/static/cpp/
SOURCES = $(SOURCE_FOLD)solve.cpp $(SOURCE_FOLD)sortballs.cpp

# The default target.
all: $(TARGET)

# Rule to build the DLL.
$(TARGET): $(SOURCES)
	$(CXX) $(CXXFLAGS) -o $(TARGET) $(SOURCES) $(LDFLAGS)

# Clean up the generated DLL.
clean:
	rm -f $(TARGET)