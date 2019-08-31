# setup-flutter

This action sets up a flutter environment for use in actions by:

- optionally downloading and installing a version of flutter by channel and adding to PATH

# Usage

See [action.yml](action.yml)

Basic:
```yaml
steps:
  - uses: actions/checkout@master
  - uses: tnc1997/github-actions/setup-flutter@master
    with:
      channel: 'stable'
  - run: flutter build appbundle
  - run: flutter build ios
```

Matrix Testing:
```yaml
jobs:
  build:
    runs-on: macOS-latest
    strategy:
      matrix:
        flutter: [ 'stable', 'beta', 'dev' ]
    steps:
      - uses: actions/checkout@master
      - uses: tnc1997/github-actions/setup-flutter@master
        with:
          channel: ${{ matrix.flutter }}
      - run: flutter build appbundle
      - run: flutter build ios
```
