# Description
I got some incredible visual results from playing around with Vidiot in the digital lab. What's more is that I learned principles of modulation with oscillator input behind those crazy effects.  I was trying to use my understanding to reproduce the visual results of the experiment. Also, I want to simulate the retro visual effects on the CRT display. I implemented the video input for the camera and displayed it as a texture in my demo.  I created Sine oscillator, Square wave oscillator, Triangle oscillator, and Noise to modulate the video in different ways. They've done a good job of emulating the pathing of 'Sine Out', 'Square Out', 'Triangle Out' and "Noise out" in vidiot. In addition, I added functions of Brightness control, Luma inversion, Luma Keying and RGB controls in my demo, which are used to implement the functions of corresponding knobs on Vidiot.  Finally, I added up all of these effects, and I got something like this [result form digital lab](./pictures/12.jpg).
# Feedback
I got some feedbacks from John.
1. This demo brings authentic Analog Video experience, tt restores the experiment results in vidiot very well.
2. The keyborad input is amazing. It is so convenient for users to try different combinations of oscillators and effects.
3. It does remind John of retro visual effects on the CRT display.
4. But it only has horizontal modulation, it would be better to add some vertical modulations, or try to mimic the diamond input on vidiot, which might combine to create more unexpected effects.
