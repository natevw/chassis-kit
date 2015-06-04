int incomingByte = 0;   // for incoming serial data

float motorA, motorB;

void setup() {
        Serial.begin(9600);     // opens serial port, sets data rate to 9600 bps
        
        pinMode(0, OUTPUT);
        pinMode(1, OUTPUT);
        pinMode(2, OUTPUT);
        pinMode(3, OUTPUT);
}

void loop() {

        // send data only when you receive data:
        if (Serial.available() > 0) {
                // read the incoming byte:
                incomingByte = Serial.read();
                incomingByte -= 0x30;

                // say what you got:
                Serial.print("I received: ");
                Serial.println(incomingByte, DEC);
        } else return;
        
        switch (incomingByte) {
          case 0:
          default:
            motorA = 0;
            motorB = 0;
            break;
          case 1:
            motorA = +1;
            motorB = +1;
            break;
          case 2:
            motorA = +1;
            motorB = -1;
            break;
          case 3:
            motorA = -1;
            motorB = +1;
            break;
          case 4:
            motorA = -1;
            motorB = -1;
            break;
        }
        
        analogWrite(0, (motorA > 0) ? +motorA * 255 : 0);
        analogWrite(1, (motorA < 0) ? -motorA * 255 : 0);
        analogWrite(2, (motorB > 0) ? +motorB * 255 : 0);
        analogWrite(3, (motorB < 0) ? -motorB * 255 : 0);
        //delay(500);
}
 
