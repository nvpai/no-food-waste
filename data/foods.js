// import userData from "./users.js";
import { ObjectId } from "mongodb";
import { foodCollection } from "./index.js";
// import validation from "./validation.js";

const exportedMethods = {
  async addFood(
    itemName,
    quantity,
    unit,
    expiryDate,
    costPerItem,
    totalCost,
    brand,
    category,
    status
  ) {
    async function run() {
      // Connect to the Atlas cluster
      try {
        //Input check will do it later

        //  Create a new document
        let newFoodItem = {
          userId: new ObjectId(), // this should come from somewhere else
          itemName: itemName,
          quantity: quantity,
          unit: unit,
          expiryDate: expiryDate,
          costPerItem: costPerItem,
          totalCost: totalCost,
          brand: brand,
          category: category,
          status: status,
        };
        //const foodCollection = await food();
        const insertInfo = await foodCollection.insertOne(newFoodItem);
        if (!insertInfo.acknowledged || !insertInfo.insertedId)
          throw "Could not add food item";

        const newId = insertInfo.insertedId.toString();
        const food = await foodCollection.findOne({ _id: new ObjectId(newId) });
        if (food === null) throw "No food with that id";
        food._id = food._id.toString();

        //console.log(food)
        return food;
      } catch (err) {
        console.log(err.stack);
      } finally {
        await client.close();
      }
    }
    run().catch(console.dir);
  },

  async getAllFood() {
    try {
      let foodList = await foodCollection
        .find({})
        .project({ _id: 1, itemName: 1, expiryDate: 1 })
        .toArray();
      if (!foodList) throw "Could not get all food";

      foodList = foodList.map((element) => {
        element._id = element._id.toString();
        return element;
      });
      //console.log(foodList);
      return foodList;
    } catch (err) {
      console.log(err.stack);
    } finally {
      await client.close();
    }
  },
  async getFoodById(foodId) {
    try {
      if (!ObjectId.isValid(foodId)) throw "invalid object ID";

      const food = await foodCollection.findOne({ _id: new ObjectId(foodId) });
      if (food === null) throw `No food with that id: ${foodId}`;
      food._id = food._id.toString();
      return food;
    } catch (err) {
      console.log(err.stack);
    } finally {
      await client.close();
    }
  },
  async removeFood(foodId) {
    try {
      if (!ObjectId.isValid(foodId)) throw "invalid object ID";

      const DeleteInfo = await foodCollection.findOneAndDelete({
        _id: new ObjectId(foodId),
      });
      if (!DeleteInfo) {
        throw `Could not delete food of provided id: ${foodId}`;
      }
      let deletedObj = { itemName: DeleteInfo.itemName, deleted: true };
      return deletedObj;
    } catch (err) {
      console.log(err.stack);
    } finally {
      await client.close();
    }
  },
  async updateFood(
    foodId,
    userId,
    itemName,
    quantity,
    unit,
    expiryDate,
    costPerItem,
    totalCost,
    brand,
    category,
    status
  ) {
    try {
      let FoodItem = {
        _id: new ObjectId(foodId),
        userId: new ObjectId(userId), // this should come from somewhere else
        itemName: itemName,
        quantity: quantity,
        unit: unit,
        expiryDate: expiryDate,
        costPerItem: costPerItem,
        totalCost: totalCost,
        brand: brand,
        category: category,
        status: status,
      };

      const updateInfo = await foodCollection.findOneAndUpdate(
        { _id: new ObjectId(foodId) },
        { $set: FoodItem },
        { returnDocument: "after" }
      );
      if (!updateInfo)
        throw `Error: Update failed! Could not update inventory with id ${foodId}`;

      return updateInfo;
    } catch (err) {
      console.log(err.stack);
    } finally {
      await client.close();
    }
  },
};
export default exportedMethods;
