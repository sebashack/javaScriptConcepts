/* Example of constructors */

//Set instance specific data.
function Person(name) {
    this.name = name;
}


//Set shared behavior among instances
Person.prototype.describe = function() {
    return 'Person named ' + this.name;
};



/* Example of inheritance between constructors */

//Super Constructor

function Animal(species, name) {
    this.species = species;
    this.name = name;
}

//The constructor property points to the Animal Function.
Animal.prototype.constructor = Animal;

Animal.prototype.getSpecies = function() { return this.species; };
Animal.prototype.greetAnimal = function() { return 'hi ' + this.name; };


//Sub Constructor
function Dog(species, name, breed, color) {
    Animal.call(this, species, name);
    this.breed = breed;
    this.color = color;
}


// Inheriting Prototype Properties

//Create a proxy object whose [[prototype]] is Super.prototype.
var proxy = Object.create(Animal.prototype);


Dog.prototype = proxy;
//The constructor property points to the Dog function.
proxy.constructor = Dog;

Dog.prototype.greetPerson = function(name) { return 'hi ' + name };


var dog = new Dog('mammal', 'charlie', 'chiwawa', 'black');


//Now let's make a Super call over an overriden method

//Overriding a method
Dog.prototype.greetAnimal = function() { return "I'm the nicest Dog" };


//Making Super Call
var superCall = Animal.prototype.greetAnimal.call(dog);


