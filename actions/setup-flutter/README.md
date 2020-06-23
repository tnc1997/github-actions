# setup-flutter

This action sets up a Flutter environment for use in actions by:

- optionally downloading and installing a version of Flutter by channel and adding to PATH

## Usage

See [action.yml](action.yml)

Basic:
```yaml
steps:
  - uses: actions/checkout@master
  - uses: tnc1997/github-actions/actions/setup-flutter@setup-flutter_v1
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
        channel: [ 'stable', 'beta', 'dev' ]
    steps:
      - uses: actions/checkout@master
      - uses: tnc1997/github-actions/actions/setup-flutter@setup-flutter_v1
        with:
          channel: ${{ matrix.channel }}
      - run: flutter build appbundle
      - run: flutter build ios
```
