# mealsteals
This new repo was created to establish a new ionic project with the most upgraded v1 version and cordova version 6+

#run instructions

ionic platform add ios

ionic prepare ios

Set your signing cert in the ios xcode project

Now run ionic build ios

You should then be able to run from xcode straight to the device

These instructions are the same for android, just with android instead of ios


#Bug with Android Splash Screen/Icon
Right now the android resources are not automatically copied once you add the android platfom

To see the appropriate splash screen and icon copy all folders from /res to platforms/android/res

Do Not just copy the entire folder and overwrite the other one, since there are folders in platforms/android/res that are not in /res

Just copy all folders under /res then go into /platforms/android/res and paste them in

This bug is caused by something with cordova/ionic not appropriately copying the resources, not sure when it will get fixed
