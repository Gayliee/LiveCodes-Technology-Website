#include <iostream>

#ifdef _WIN32
#include <windows.h>
#endif

int main() {
#ifdef _WIN32
    SetConsoleOutputCP(CP_UTF8); // needed so the block characters display correctly
#endif

    std::cout << R"( ▄▄▄▄▄▄           ▄▄▄  ▄▄▄                 ▄▄▄▄▄▄▄
 █▀██▀▀▀█▄        █▀██  ██         █▄      █▀▀██▀▀▀▀
   ██▄▄▄█▀          ██  ██         ██         ██   ▄                ▄▄
   ██▀▀█▄   ▄█▀█▄   ██████   ▄▀▀█▄ ████▄      ██   ████▄▄▀▀█▄ ▄███▀ ██ ▄█▀
 ▄ ██  ██   ██▄█▀   ██  ██   ▄█▀██ ██ ██      ██   ██   ▄█▀██ ██    ████
 ▀██▀  ▀██▀▄▀█▄▄▄ ▀██▀  ▀██▄▄▀█▄██▄████▀      ▀██▄▄█▀  ▄▀█▄██▄▀███▄▄██ ▀█▄
)";

    return 0;
}
