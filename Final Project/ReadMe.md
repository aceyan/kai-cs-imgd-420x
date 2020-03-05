# Kai's Final Project - GPGPU Flocking
- URL of the live running website: https://aceyan.github.io/kai-cs-imgd-420x/Final%20Project/main.html
- URL of video playing on Desktop: https://www.youtube.com/watch?v=DczSlQ-ay_g&list=PLIMWjVyozR_z2WcWDcdieFXirRUM6_0_U&index=6&t=0s
- URL of video playing on mobile using gyroscope: https://www.youtube.com/watch?v=ulkGM_eWtRU&list=PLIMWjVyozR_z2WcWDcdieFXirRUM6_0_U&index=7&t=0s

This demo needs a browser that supports webGL2, EXT_color_buffer_float extension and GPU instance!

## Playing Instruction: 
1. CHECK the mouseCentral on the UI, boids/particles will follow mouse cursor.
2. CHECK the mousePredator on the UI,  boids/particles will avoid the mouse cursor.
3. CHECK the gyroscope on the GUI to use gyroscope on mobile devices to interact with particles (Chrome destop version can simulate the gyroscope in DEBUG mode!)

## Technical Goal: 
1. Explore the efficiency and visual effect of flocking algorithm by utilizing the parallel computing power of GPU. The algorithm is a little slow on the CPU. On my laptop, the picture is almost frozen when the number of objects goes up to 1000. I will implement the algorithm on GPU and try to optimize the performance to see how many objects can run on the GPU. And this project will explore the visual effect of flocking behavior when the number of individuals is very large.
2. Since two textures (postition texture and velocity texture) should be drawn in one draw call. In order to optimize the process and performance, MRT (multiple render targets) technology will be used.
3. Extension (WEBGL_draw_buffers) is required for webGL1 to do MRT. However, MRT is a built-in feature in webGL2, so I will use WebGL2 in my project to do MRT.
4. Explore how to add mouse interaction. Implement the behavior of predator (particles will avoid the mouse cursor) and chasing (particles will follow the mouse cursor) in the program.
5. Explore how particles can interact with gravity by using gyroscope.
6. Use UI to adjust various parameters to make it more convenient for users to see the influence of these parameters on flocking behavior and have a better understanding of the characteristics of this algorithm.
7. Add post-effect motion blur.
8. Add GPU instance.

## Aesthetic goals:
The aesthetic goal of my project is to simulate large-scale flocking activity. When I played with code challenging tutorial, I found that I could only run 1000 instances on the my laptop. I was curious about the clustering of thousands of particles when using GPU to do calculation. And I've found that when we look at a group of just a few hundred members, it's easier to focus on individual behavior. But What happens when there are tens of thousands or more of them? My project will simulate the behavior of a large number of individuals. I will add motion blur for a better observation to the track of particle movement. The mouse interaction allows players to interact with the boids and have a better udnerstanding on the flocking behavior. Players can even interact on mobile devices using gyroscopes, where particles move in the direction of gravity. Of course, I will add my favorite rainbow color. I love rainbow!

## Visual Aesthetics:
I created a colorful flocking simulator. At first, it was single-colored, so I use color adjustment to make it look colorful. The UI I added allows users to easily change parameters, which allows for interesting flocking behavior of particles. The double buffer rendering makes the picture smooth, and the addition of Motion blur makes the picture elements richer.

## Implementation:
When learning flocking algorithm and playing with code challenging video tutorial, I always wanted to try to implement it on the GPU. The algorithm itself is well suited for parallel computation, because the update of each small object depends on the location and speed information of other objects around it.   
I thought doing GPGPU would have to use compute shader, but I was wrong. Actually, a lot of parallel calculations can be done using fragment shader. Even the three.js do it in this way. When doing GPGPU on fragment shader, we think of texture as a collection of data rather than a set of pixels, and we consider colors of the output as the result of the calculation. With this inspiration I have my implementation design.  
The working flow of my program is shown in this [flow map](./flowMap/flowMap.png). I use texture to store the location and velocity information for each object. Each update of the location and velocity of the object is based on the current location and velocity of the object and information about the objects around it. This update process utilizes fragment shader to compute in parallel on the GPU for each object. Ping-pong draws between the two framebuffers constantly updates the location and velocity of objects. Each frame is drawn by using the location data saved in the position texture.   

Here are some implementation details and challenges:
1. Since I need to update two textures (position texture and velocity texture) at a time, it is natural for me to want to draw two textures at one draw call. This requires the MRT (multiple render targets) feature. Extension (WEBGL_draw_buffers) is required for webGL1 to do MRT. After many attempts, the chrome browser still failed to work with this Extension on my laptop. So I decided to implement it using webGL2. In the webGL2 context we can use MRT without Extension. This allows me to use a drawCall to update both textures which are both color attachments of a same framebuffer at the same time.
2. floating-point texture. The floating-point texture in webGL1 requires OES_texture_float extension. But in webGL2 we need EXT_color_buffer_float extension.
3. On how to use each vertex in the position texture to draw the screen, the initial solution was to use distance field. Now that each pixel in the position texture is traversed by fragment shader (the color value of each pixel contains the position information of an object in the xy component), the distance comparison between position of current pixel and the location saved in the position texture determines whether or not the current pixel is colored. This process is less efficient because as the number of objects increases, the number of pixels that need to be traversed in the position texture increases exponentially!  
To solve this problem, I use VTF (Vertex Texture Fetch). It is a technique for accessing textures in vertex shader and then modifying vertex data. The displacement mapping mentioned in Final project.md also uses this technique. I draw each object as a point, and in vertex shader I use the index of the object to calculate which pixel of the position texture and velocity texture its position and velocity information are stored in. So that only one pixel of the position and velocity textures is needed to draw an object, greatly optimizing the rendering efficiency. Now I can run 20,000-objects flocking simulation on my laptop.    
Also, I use GPU instance feature to draw thounsands particles whitout assigning a big vertex array. I only used an array of vertices of length 1 to render tens of thousands of particles.
4. By adjusting parameters in the flocking algorithm, I implement the behavior of predator (particles will avoid the mouse cursor) and chasing (particles will follow the mouse cursor) in the program. And with the gyroscope, particles are always move towards gravity. Because I converted gyroscope's data into positions in the NDC(Normalized device coordinates) to make it interact with particles.
5. Flicker problem resolution. In the process of implementing the drawing, I noticed a flicker (thank you for pointing out the issue), even though I set the framerate to 60. It turned out to be because I cleaned the framebuffer before each frame was drawn. So I added double buffering to solve this problem. Motion blur, a post-effect, based on the double buffered drawing, is also implemented in my project. It can help us better observe the trajectory of particles.

## Feedback:
