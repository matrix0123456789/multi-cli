#!/usr/bin/env bash

rm multi-cli.deb
rm control.tar.gz
rm data.tar.gz
rm -rf controlCopy

cp -r control controlCopy

let SIZE=`du -s . | sed s'/\s\+.*//'`+8
sed s"/SIZE/${SIZE}/" -i controlCopy/control

mkdir data
mkdir data/usr
mkdir data/usr/share
mkdir data/usr/share/multi-cli
mkdir data/bin/
cp -r ../../bin data/usr/share/multi-cli/bin
cp -r ../../src data/usr/share/multi-cli/src
cp -r ../../package.json data/usr/share/multi-cli/
ln -s data/usr/share/multi-cli/bin/multi-cli data/bin/multi-cli




find . -type d -exec chmod 0755 {} \;
find . -type f -exec chmod go-w {} \;
chown -R root:root .

pushd data
tar czf ../data.tar.gz *
popd
pushd controlCopy
tar czf ../control.tar.gz *
popd


echo 2.0 > ./debian-binary

ar r ./multi-cli.deb debian-binary control.tar.gz data.tar.gz
