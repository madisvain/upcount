# Bump version
Bump the version number in package.json to (1.0.0) the version you are about to release.

# Create a tag
git tag -a v1.0.0 -m "v1.0.0"

# Push the tag to Github
git push origin v1.0.0

# Actions
Watch that [actions run](https://github.com/madisvain/upcount/actions) successfully

# Changelog
Edit [release details](https://github.com/madisvain/upcount/releases) to create a changelog

# Publish the release
Remove the _This is a pre-release_  boolean and publish the release as *latest*