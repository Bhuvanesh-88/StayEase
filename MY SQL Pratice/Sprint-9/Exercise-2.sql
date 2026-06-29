-- ✅ Task 1: Prevent Overbooking
DELIMITER //

CREATE TRIGGER prevent_overbooking
BEFORE INSERT ON booking
FOR EACH ROW
BEGIN
    DECLARE availability VARCHAR(150);

    SELECT availability_status INTO availability 
    FROM property 
    WHERE property_id = NEW.property_id;

    IF availability = 'unavailable' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Booking not allowed. Property is unavailable.';
    END IF;
END;
//

-- 🔁 Test Query for Task 1 (Insert for unavailable property - should FAIL)
INSERT INTO booking (customer_id, property_id, check_in_date, check_out_date, total_amount, status)
VALUES (2, 8, '2025-08-10', '2025-08-12', 30000, 'CONFIRMED');

-- ✅ Task 2: Update Availability on Booking
CREATE TRIGGER update_property_availability
AFTER INSERT ON booking
FOR EACH ROW
BEGIN
    UPDATE property 
    SET availability_status = 'unavailable'
    WHERE property_id = NEW.property_id;
END;
//

-- 🔁 Test Query for Task 2 (Insert booking - should UPDATE property status)
INSERT INTO booking (customer_id, property_id, check_in_date, check_out_date, total_amount, status)
VALUES (3, 6, '2025-08-15', '2025-08-17', 24000, 'CONFIRMED');

-- Check result
SELECT availability_status FROM property WHERE property_id = 6;

-- ✅ Task 3: Log Property Price Changes

-- Step 1: Create price_log table
CREATE TABLE IF NOT EXISTS price_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    change_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES property(property_id)
);

-- Step 2: Create Trigger
CREATE TRIGGER log_price_change
BEFORE UPDATE ON property
FOR EACH ROW
BEGIN
    IF OLD.price_per_night != NEW.price_per_night THEN
        INSERT INTO price_log (property_id, old_price, new_price)
        VALUES (OLD.property_id, OLD.price_per_night, NEW.price_per_night);
    END IF;
END;
//

DELIMITER ;

-- 🔁 Test Query for Task 3 (Update property price - should log entry)
UPDATE property 
SET price_per_night = 22000.00 
WHERE property_id = 3;

-- Check log table
SELECT * FROM price_log;
